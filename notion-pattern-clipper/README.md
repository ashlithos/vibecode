# Pattern Clipper for Notion

A Chrome extension that screenshots the tab you're on and saves it to a Notion database, along with a title, your notes and tags.

**How it works:** you click the icon, fill in the popup and hit **Save Pattern**. Behind the scenes the extension:

1. takes a screenshot of the visible tab,
2. uploads it to Imgur, which gives back a public link (Notion only accepts images by link),
3. creates a new page in your Notion database. The title and tags go in as properties, and your notes, the screenshot and a link to the source page go in the page body.

Shortcut: `Alt+Shift+P` (`Option+Shift+P` on Mac) opens the popup, and `⌘/Ctrl+Enter` saves. Whatever you've typed is kept if the popup closes before you save.

## Setup (about 10 minutes)

### 1. Make the Notion database

Make a new full-page database in Notion with these two properties:

| Property | Type |
|---|---|
| `Name` | Title (every database starts with one) |
| `Tags` | Multi-select |

Optional: add a `URL` property (type URL) and set `NOTION_URL_PROPERTY = "URL"` in `background.js` to save the source link as a column too.

### 2. Get a Notion secret

1. Go to <https://www.notion.so/profile/integrations>, click **New integration**, give it a name, and pick your workspace. Leave the type as **Internal**.
2. Copy the **Internal Integration Secret** (it starts with `ntn_`).
3. Open your database in Notion, click **⋯** (top right), then **Connections**, and add your integration. **If you skip this step, Notion returns "object_not_found".**

### 3. Get the database ID

Open the database as a full page and copy its URL:

```
https://www.notion.so/yourname/0123456789abcdef0123456789abcdef?v=...
                               └──────── this part ───────────┘
```

The 32 characters before `?v=` are the ID.

### 4. Get an Imgur Client ID

1. Sign in at <https://api.imgur.com/oauth2/addclient>.
2. Pick **OAuth 2 authorization without a callback URL** and fill in a name and your email.
3. Copy the **Client ID**. You don't need the Client Secret.

### 5. Paste the three values

Open `background.js`. The top of the file has a clearly marked block:

```js
const IMGUR_CLIENT_ID = "PASTE_YOUR_IMGUR_CLIENT_ID";
const NOTION_SECRET = "PASTE_YOUR_NOTION_SECRET";
const NOTION_DATABASE_ID = "PASTE_YOUR_NOTION_DATABASE_ID";
```

### 6. Load it in Chrome

1. Go to `chrome://extensions` and turn on **Developer mode** (top right).
2. Click **Load unpacked** and choose this `notion-pattern-clipper` folder.
3. Pin it from the puzzle-piece menu.

If you change any file later, click the **↻** reload icon on the extension's card.

## Good to know

- **Imgur links are public.** Anyone with the link can see the image, though it isn't listed anywhere. Don't clip anything confidential (internal tools, NDA work). For private captures, the extension could later switch to Notion's own file upload API.
- **Keep your keys out of GitHub.** After you paste them in, don't commit `background.js` with the real values. One way: `git update-index --skip-worktree background.js`.
- Chrome doesn't allow screenshots of `chrome://` pages or the Chrome Web Store.
- **Debugging:** on `chrome://extensions`, click **service worker** on the extension's card to open its console. Errors show up there and in the popup.

## Files

| File | What it does |
|---|---|
| `manifest.json` | Tells Chrome what the extension is and what it's allowed to do (`activeTab`, `storage`, Imgur and Notion access) |
| `popup.html` / `styles.css` | The small window that opens when you click the icon |
| `popup.js` | Handles the form: loading, success and error states, saving drafts, and messaging the background |
| `background.js` | Does the work: screenshot → Imgur → Notion. **Your credentials go here.** |
