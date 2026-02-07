import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const { GMAIL_USER, GMAIL_PASS, PORT = 4000, DISABLE_TLS_VERIFY } = process.env;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.warn('GMAIL_USER or GMAIL_PASS not set. /send-email will fail.');
}
if (DISABLE_TLS_VERIFY === 'true') {
  console.warn('WARNING: TLS certificate verification is DISABLED (DISABLE_TLS_VERIFY=true). This is insecure and should only be used for development or troubleshooting.');
}

const tlsOptions = DISABLE_TLS_VERIFY === 'true' ? { rejectUnauthorized: false } : undefined;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  },
  ...(tlsOptions ? { tls: tlsOptions } : {})
});

if (DISABLE_TLS_VERIFY === 'true') {
  console.warn('Nodemailer transporter configured with tls.rejectUnauthorized=false');
}

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint expected by the frontend: accepts multipart/form-data with fields 'to' and 'body', and files under 'files'
// Use upload.any() to be flexible about field names (we'll filter by 'files')
app.post('/api/send-invoices', upload.any(), async (req, res) => {
  const to = req.body.to;
  const body = req.body.body;
  const subject = req.body.subject || 'Invoice from Mazzari Landscape Management';

  if (!to || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, body' });
  }

  // Debug: log received files
  if (req.files) {
    console.log('Received files:', req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, size: f.size })));
  }

  const allFiles = req.files || [];
  const fileFields = allFiles.filter(f => f.fieldname === 'files');
  const attachments = (fileFields || []).map((f) => ({
    filename: f.originalname || f.fieldname,
    content: f.buffer
  }));

  // Build HTML and text body with appended textual signature (no logo)
  const escapeHtml = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
  const signatureHtml = `
    <hr />
    <div style="font-family: Inter, system-ui, sans-serif; color:#444; font-size:12px;">
      <p style="margin:0">Wali Hassan Zada</p>
      <p style="margin:0">Mazzari Landscape Management</p>
      <p style="margin:0">0431716975</p>
      <p style="margin:0">Brisbane, Queensland 4131</p>
      <p style="margin:0"><a href="https://mazzari.com.au/">https://mazzari.com.au/</a></p>
      <p style="margin:0">Mazzari Landscape Management</p>
    </div>
  `;

  const htmlBody = `<div>${escapeHtml(body).replace(/\n/g, '<br/>')}</div>${signatureHtml}`;
  const textBody = `${body}\n\nWali Hassan Zada\nMazzari Landscape Management\n0431716975\nBrisbane, Queensland 4131\nhttps://mazzari.com.au/\n\nMazzari Landscape Management`;

  try {
    const info = await transporter.sendMail({
      from: GMAIL_USER,
      to,
      subject,
      text: textBody,
      html: htmlBody,
      attachments
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('sendMail error', err);
    res.status(500).json({ error: 'Failed to send email', details: err instanceof Error ? err.message : null });
  }
});

app.post('/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, text/html' });
  }

  // Append the standard textual signature (no logo)
  const signatureHtml = `
    <hr />
    <div style="font-family: Inter, system-ui, sans-serif; color:#444; font-size:12px;">
      <p style="margin:0">Wali Hassan Zada</p>
      <p style="margin:0">Mazzari Landscape Management</p>
      <p style="margin:0">0431716975</p>
      <p style="margin:0">Brisbane, Queensland 4131</p>
      <p style="margin:0"><a href="https://mazzari.com.au/">https://mazzari.com.au/</a></p>
    </div>
  `;
  const textSignature = `\n\nWali Hassan Zada\nMazzari Landscape Management\n0431716975\nBrisbane, Queensland 4131\nhttps://mazzari.com.au/\n\n`;

  const finalHtml = (html ? String(html) : '') + signatureHtml;
  const finalText = (text ? String(text) : '') + textSignature;

  try {
    const info = await transporter.sendMail({
      from: GMAIL_USER,
      to,
      subject,
      text: finalText,
      html: finalHtml
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('sendMail error', err);
    res.status(500).json({ error: 'Failed to send email', details: err instanceof Error ? err.message : null });
  }
});

app.get('/', (req, res) => res.send('Email server is running'));

app.listen(PORT, () => console.log(`Email server listening on ${PORT}`));
