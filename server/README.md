# Green Invoice - Email Server ⚙️

This small Express server sends email via Gmail SMTP using `nodemailer`.

## Setup

1. Copy `.env.example` to `.env` and set values:

   - `GMAIL_USER` — your Gmail address (e.g. `you@gmail.com`)
   - `GMAIL_PASS` — a Gmail **App Password** (recommended) or account password if allowed
   - `PORT` — port to run the server (default `4000`)

2. Install dependencies and start:

   cd server
   npm install
   npm run start

For development with automatic restarts (requires `nodemon`):

   npm run dev

## Usage

POST /send-email

Content-Type: application/json

Body:

{
  "to": "recipient@example.com",
  "subject": "Invoice from Green Invoice",
  "text": "Plain text body",
  "html": "<p>HTML body</p>"
}

Response:

{
  "success": true,
  "messageId": "..."
}

Notes:
- Use a Gmail App Password (https://support.google.com/accounts/answer/185833) when your account has 2FA enabled. Regular account passwords may be blocked by Google for security reasons.
- Keep `.env` out of version control.
