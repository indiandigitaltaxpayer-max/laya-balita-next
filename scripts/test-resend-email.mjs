import fs from 'node:fs/promises';
import path from 'node:path';
import { Resend } from 'resend';

const root = process.cwd();
const testRecipient = process.argv[2] || 'indiandigitaltaxpayer@gmail.com';

async function loadLocalEnv() {
  try {
    const envFile = await fs.readFile(path.join(root, '.env.staging.example'), 'utf8');

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
    // .env.local is optional when values are already set in the shell.
  }
}

await loadLocalEnv();

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is required. Add your real Resend API key in .env.local or GoDaddy Secrets.');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM || 'Laya Balita <onboarding@resend.dev>';

const { data, error } = await resend.emails.send({
  from,
  to: testRecipient,
  subject: 'Laya Balita Resend test email',
  html: '<p>Congrats, Laya Balita email sending through <strong>Resend</strong> is working.</p>',
  text: 'Congrats, Laya Balita email sending through Resend is working.',
});

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(JSON.stringify({
  sent: true,
  id: data?.id,
  to: testRecipient,
  from,
}, null, 2));
