# CarePoint Pharmacy Notice Hub

A small organization communication platform for CarePoint Pharmacy. The app combines private team chat, pharmacy notices, document and image uploads, an organization information page, and an online store landing page.

## Features

- Name and access-code login
- Real-time-style team chat with sender badges and timestamps
- Send messages with Enter or use Shift+Enter for a new line
- Upload pharmacy documents and images from chat or the Files page
- Dedicated shared Files library with search and downloads
- Notice board for general pharmacy information
- Add and publish new organization notices
- CarePoint Pharmacy About page
- Online store page for pharmacy essentials, wellness, and personal care
- Signed-out confirmation page
- Cyan pharmacy-focused visual design

## Run locally

Requirements:

- Node.js 18 or newer
- npm

Install dependencies and start the server:

```powershell
npm install
npm start
```

Open `http://localhost:3000` in your browser.

## Access code

The default development access code is:

```text
NOTICE2026
```

Set a different code before starting the server:

```powershell
$env:NOTICE_ACCESS_CODE="your-new-code"
npm start
```

For a permanent Windows user environment variable:

```powershell
setx NOTICE_ACCESS_CODE "your-new-code"
```

Restart the terminal and server after using `setx`.

## Main pages

- `/` or `/login.html` - Sign in
- `/chat.html` - Team chat and chat attachments
- `/files.html` - Shared document and image library
- `/notice-board.html` - Organization notices and notice publishing
- `/about.html` - About CarePoint Pharmacy
- `/store.html` - Online store categories
- `/signed-out.html` - Successful logout confirmation

## API overview

- `POST /api/login`
- `POST /api/logout`
- `GET /api/messages`
- `POST /api/messages`
- `GET /api/files`
- `POST /api/upload`
- `GET /api/notices`
- `POST /api/notices`

Uploaded files are stored locally in `uploads/`. The folder is excluded from Git commits.

## Production note

This project currently uses in-memory sessions and data for development. For production use, connect the API to a database, use a persistent session store, add role-based permissions, and configure secure HTTPS deployment.
