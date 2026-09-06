import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';

const root = process.cwd();

async function loadLocalEnv() {
  try {
    const envFile = await fs.readFile(path.join(root, '.env.local'), 'utf8');

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex);
      let value = trimmed.slice(separatorIndex + 1);

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      process.env[key] ||= value;
    }
  } catch {
    // Environment may already be provided by the shell or hosting platform.
  }
}

await loadLocalEnv();

const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing SMTP environment values: ${missing.join(', ')}`);
  process.exit(1);
}

const timeoutMs = Number(process.env.SMTP_TIMEOUT_MS || 12000);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  connectionTimeout: timeoutMs,
  greetingTimeout: timeoutMs,
  socketTimeout: timeoutMs,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.verify();

const result = await transporter.sendMail({
  from: process.env.EMAIL_FROM || process.env.SMTP_USER,
  to: process.env.ADMIN_EMAIL,
  subject: 'Laya Balita SMTP test',
  text: 'This is a test email from the Laya Balita backend SMTP configuration.',
});

console.log(`SMTP verified. Test email queued with message id: ${result.messageId}`);
