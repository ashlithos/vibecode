// background.js: the service worker. Captures the tab, uploads to Imgur, creates the Notion page.

// ============================================================================
//  🔑  YOUR CREDENTIALS: paste them here (see README.md for where to find each)
// ============================================================================

const IMGUR_CLIENT_ID = "PASTE_YOUR_IMGUR_CLIENT_ID";     // api.imgur.com → Register an application
const NOTION_SECRET = "PASTE_YOUR_NOTION_SECRET";         // starts with "ntn_" (or "secret_")
const NOTION_DATABASE_ID = "PASTE_YOUR_NOTION_DATABASE_ID"; // the 32-character ID in the database's URL

// Property names in your Notion database. Change these if your columns are named differently.
const NOTION_TITLE_PROPERTY = "Name"; // the database's title column (type: Title)
const NOTION_TAGS_PROPERTY = "Tags";  // type: Multi-select
const NOTION_URL_PROPERTY = "";       // optional: e.g. "URL" (type: URL). Leave "" to skip.

// ============================================================================

const NOTION_VERSION = "2022-06-28"; // stable version that accepts a database_id parent
const NOTION_TEXT_LIMIT = 2000;      // Notion's max characters per text chunk

// ---------- Message handling ----------

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "SAVE_PATTERN") return false;

  savePattern(message.payload)
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch((err) => {
      console.error("[Pattern Clipper]", err);
      sendResponse({ ok: false, error: err.message || String(err) });
    });

  return true; // keep the message channel open for the async response
});

function reportProgress(step) {
  // The popup may have closed; that's fine, the save keeps going.
  chrome.runtime.sendMessage({ type: "CLIP_PROGRESS", step }).catch(() => {});
}

// ---------- The flow ----------

async function savePattern({ title, notes, tags, windowId, sourceUrl, sourceTitle }) {
  checkConfig();

  // 1. Screenshot
  const dataUrl = await captureTab(windowId);

  // 2. Imgur
  reportProgress("Uploading image…");
  const imageUrl = await uploadToImgur(dataUrl, title);

  // 3. Notion
  reportProgress("Saving to Notion…");
  const page = await createNotionPage({ title, notes, tags, imageUrl, sourceUrl, sourceTitle });

  return { pageUrl: page.url, imageUrl };
}

function checkConfig() {
  const missing = [];
  if (!IMGUR_CLIENT_ID || IMGUR_CLIENT_ID.startsWith("PASTE_")) missing.push("Imgur Client ID");
  if (!NOTION_SECRET || NOTION_SECRET.startsWith("PASTE_")) missing.push("Notion secret");
  if (!NOTION_DATABASE_ID || NOTION_DATABASE_ID.startsWith("PASTE_")) missing.push("Notion database ID");
  if (missing.length) {
    throw new Error(`Add your ${missing.join(", ")} at the top of background.js, then reload the extension.`);
  }
}

// ---------- 1. Screenshot ----------

async function captureTab(windowId) {
  try {
    // activeTab (granted when you click the icon) allows this. PNG keeps UI text crisp.
    return await chrome.tabs.captureVisibleTab(windowId ?? chrome.windows.WINDOW_ID_CURRENT, { format: "png" });
  } catch (err) {
    throw new Error(
      "Couldn't capture this tab. Chrome blocks screenshots of chrome:// pages and the Web Store. " +
        `(${err.message})`
    );
  }
}

// ---------- 2. Imgur ----------

async function uploadToImgur(dataUrl, title) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");

  const body = new FormData();
  body.append("image", base64);
  body.append("type", "base64");
  body.append("title", title);

  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
    body,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const reason = json?.data?.error?.message || json?.data?.error || res.statusText;
    if (res.status === 429) throw new Error("Imgur rate limit hit. Wait a bit and try again.");
    throw new Error(`Imgur upload failed (${res.status}): ${reason}`);
  }

  return json.data.link; // e.g. https://i.imgur.com/abc123.png
}

// ---------- 3. Notion ----------

async function createNotionPage({ title, notes, tags, imageUrl, sourceUrl, sourceTitle }) {
  const properties = {
    [NOTION_TITLE_PROPERTY]: {
      title: [{ text: { content: title.slice(0, NOTION_TEXT_LIMIT) } }],
    },
  };

  if (tags.length) {
    properties[NOTION_TAGS_PROPERTY] = {
      // Notion creates new tag options automatically. Commas aren't allowed inside a tag.
      multi_select: tags.map((name) => ({ name: name.slice(0, 100) })),
    };
  }

  if (NOTION_URL_PROPERTY && /^https?:/.test(sourceUrl)) {
    properties[NOTION_URL_PROPERTY] = { url: sourceUrl };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_SECRET}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DATABASE_ID },
      properties,
      children: buildBlocks({ notes, imageUrl, sourceUrl, sourceTitle }),
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Notion error (${res.status}): ${json?.message || res.statusText}${notionHint(json)}`);
  }
  return json; // includes json.url, the page link
}

function buildBlocks({ notes, imageUrl, sourceUrl, sourceTitle }) {
  const blocks = [];

  // Notes: one paragraph per line break-separated chunk, each under Notion's 2000-char limit
  if (notes) {
    for (const para of notes.split(/\n{2,}/)) {
      for (const chunk of chunkText(para, NOTION_TEXT_LIMIT)) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: chunk } }] },
        });
      }
    }
  }

  // Screenshot
  blocks.push({
    object: "block",
    type: "image",
    image: { type: "external", external: { url: imageUrl } },
  });

  // Where it came from
  if (/^https?:/.test(sourceUrl)) {
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Source: " }, annotations: { color: "gray" } },
          {
            type: "text",
            text: { content: (sourceTitle || sourceUrl).slice(0, NOTION_TEXT_LIMIT), link: { url: sourceUrl } },
          },
        ],
      },
    });
  }

  return blocks.slice(0, 100); // Notion accepts up to 100 blocks per request
}

function chunkText(text, size) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks.length ? chunks : [""];
}

function notionHint(json) {
  const code = json?.code;
  if (code === "object_not_found")
    return " → Share the database with your integration (⋯ menu → Connections) and check the database ID.";
  if (code === "unauthorized") return " → Check NOTION_SECRET.";
  if (code === "validation_error")
    return ` → Check that your database has a "${NOTION_TITLE_PROPERTY}" title and a "${NOTION_TAGS_PROPERTY}" multi-select.`;
  return "";
}
