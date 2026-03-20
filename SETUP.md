# Workspace Wrapped — Setup Guide

## Step 1: Start the app locally

```bash
npm install
npm run dev
```

This starts Vite on `http://localhost:5173` (or similar). Note the exact URL — you'll need it.

---

## Step 2: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top → **New Project**
3. Name it **Workspace Wrapped** → **Create**
4. Make sure this new project is selected

---

## Step 3: Enable the Google Calendar API

1. In the left sidebar, go to **APIs & Services → Library**
2. Search for **Google Calendar API**
3. Click on it → **Enable**

---

## Step 4: Configure the OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** → **Create**
3. Fill in:
   - **App name**: Workspace Wrapped
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes**
   - Search for `Google Calendar API` and check `.../auth/calendar.readonly`
   - Click **Update** → **Save and Continue**
6. On **Test users**, click **Add Users** and add your Google email
7. Click **Save and Continue** → **Back to Dashboard**

---

## Step 5: Create OAuth Client ID Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: **Workspace Wrapped**
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173/`
7. Click **Create**
8. Copy the **Client ID** (looks like `123456789-abc.apps.googleusercontent.com`)

---

## Step 6: Configure the App

Create a `.env` file in the project root:

```
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

Restart the dev server (`npm run dev`).

---

## Step 7: Use It

1. Open `http://localhost:5173` in your browser
2. Click **Sign in with Google**
3. Authorize the app with your Google account
4. Watch your Workspace Wrapped story unfold!

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "Google Client ID is not configured" | Make sure `.env` has `VITE_GOOGLE_CLIENT_ID` set and you restarted the dev server |
| "redirect_uri_mismatch" | The URL in Google Cloud credentials must exactly match your dev server URL (including trailing slash) |
| "access_denied" | Add your email as a test user in the OAuth consent screen |
| "No calendar events found" | Make sure the account has calendar events in the past year |
| API 403 error | Make sure Google Calendar API is enabled in your project |
