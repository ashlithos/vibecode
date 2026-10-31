// popup.js: the form, its loading/success/error states, and the message to background.js.
// No API keys live here. They're all in background.js.

const DRAFT_KEY = "draft"; // unsent text is kept in chrome.storage so closing the popup doesn't lose it

const $ = (id) => document.getElementById(id);
const root = document.querySelector(".popup");
const form = $("clip-form");
const titleInput = $("title");
const notesInput = $("notes");
const tagsInput = $("tags");
const saveButton = $("save");
const saveLabel = $("save-label");
const errorBox = $("error");
const successView = $("success");

let activeTab = null;

// ---------- State ----------

function setState(state, detail = {}) {
  root.dataset.state = state;

  const loading = state === "loading";
  saveButton.disabled = loading;
  saveLabel.textContent = loading ? detail.step || "Saving…" : "Save Pattern";

  errorBox.hidden = state !== "error";
  if (state === "error") errorBox.textContent = detail.message || "Something went wrong.";

  form.hidden = state === "success";
  successView.hidden = state !== "success";
  if (state === "success") {
    $("success-name").textContent = detail.title || "";
    $("open-link").href = detail.url || "https://www.notion.so";
  }
}

// ---------- Draft (keeps your typing if the popup closes) ----------

async function loadDraft() {
  const { [DRAFT_KEY]: draft } = await chrome.storage.local.get(DRAFT_KEY);
  if (!draft) return false;
  titleInput.value = draft.title || "";
  notesInput.value = draft.notes || "";
  tagsInput.value = draft.tags || "";
  return Boolean(draft.title || draft.notes || draft.tags);
}

function saveDraft() {
  chrome.storage.local.set({
    [DRAFT_KEY]: { title: titleInput.value, notes: notesInput.value, tags: tagsInput.value },
  });
}

function clearDraft() {
  return chrome.storage.local.remove(DRAFT_KEY);
}

// ---------- Helpers ----------

function parseTags(raw) {
  const seen = new Set();
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
}

// ---------- Save ----------

async function handleSave(event) {
  event?.preventDefault();
  if (root.dataset.state === "loading") return;

  const title = titleInput.value.trim();
  if (!title) {
    setState("error", { message: "Add a title first." });
    titleInput.focus();
    return;
  }

  setState("loading", { step: "Capturing…" });

  // Progress updates from background.js ("Uploading image…", "Saving to Notion…")
  const onProgress = (msg) => {
    if (msg?.type === "CLIP_PROGRESS") saveLabel.textContent = msg.step;
  };
  chrome.runtime.onMessage.addListener(onProgress);

  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_PATTERN",
      payload: {
        title,
        notes: notesInput.value.trim(),
        tags: parseTags(tagsInput.value),
        windowId: activeTab?.windowId,
        sourceUrl: activeTab?.url || "",
        sourceTitle: activeTab?.title || "",
      },
    });

    if (!response?.ok) throw new Error(response?.error || "No response from the extension.");

    await clearDraft();
    setState("success", { title, url: response.pageUrl });
  } catch (err) {
    setState("error", { message: err.message });
  } finally {
    chrome.runtime.onMessage.removeListener(onProgress);
  }
}

function resetForm() {
  form.reset();
  setState("idle");
  titleInput.value = activeTab?.title || "";
  titleInput.focus();
  titleInput.select();
}

// ---------- Init ----------

async function init() {
  [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const hadDraft = await loadDraft();
  if (!hadDraft && activeTab?.title) titleInput.value = activeTab.title; // prefill with the page title

  titleInput.focus();
  titleInput.select();

  form.addEventListener("submit", handleSave);
  form.addEventListener("input", saveDraft);
  $("another").addEventListener("click", resetForm);

  // Cmd/Ctrl + Enter saves from anywhere in the form
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(e);
  });
}

init();
