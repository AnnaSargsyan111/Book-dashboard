import nodemailer from "nodemailer";
import { getEnv, isProduction } from "@/server/config/env";
import { log } from "@/server/log";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  /** Optional rich version; `text` is always sent too, for clients that show plain text. */
  html?: string;
}

export interface EmailProvider {
  name: "resend" | "gmail" | "console";
  send(message: EmailMessage): Promise<void>;
}

/** Messages handled by the console provider, kept in memory for tests and local inspection (capped). */
export const devOutbox: EmailMessage[] = [];

const consoleProvider: EmailProvider = {
  name: "console",
  async send(message) {
    devOutbox.push(message);
    if (devOutbox.length > 50) devOutbox.shift();
    if (process.env.NODE_ENV !== "test") {
      // Development only: no email service is configured, so the message (with its link) is printed instead.
      console.log(`\n[DEV EMAIL: NOT SENT, RESEND_API_KEY not configured]\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`);
    }
  },
};

function resendProvider(apiKey: string, from: string): EmailProvider {
  return {
    name: "resend",
    async send(message) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text, ...(message.html ? { html: message.html } : {}) }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    },
  };
}

/**
 * Sends through a Gmail account over SMTP (smtp.gmail.com), signed in with an App password — never the account's
 * real password. Gmail delivers to any address, so this works before a domain is verified with Resend. The sender
 * is always the Gmail address itself (Gmail rewrites any other "from"), named "MystBook". Limits worth knowing:
 * about 500 messages a day, and mail from a personal Gmail can land in spam more often than from a verified domain.
 */
function gmailProvider(user: string, appPassword: string): EmailProvider {
  const transport = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass: appPassword } });
  return {
    name: "gmail",
    async send(message) {
      await transport.sendMail({ from: `MystBook <${user}>`, to: message.to, subject: message.subject, text: message.text, ...(message.html ? { html: message.html } : {}) });
    },
  };
}

export function getEmailProvider(): EmailProvider {
  const env = getEnv();
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) return gmailProvider(env.GMAIL_USER.trim(), env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""));
  if (env.RESEND_API_KEY && env.EMAIL_FROM) return resendProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
  if (isProduction()) throw new Error("RESEND_API_KEY and EMAIL_FROM must be set in production");
  return consoleProvider;
}

/** Delivery problems are logged, never surfaced to the caller (that would reveal whether an account exists). */
export async function sendEmail(message: EmailMessage): Promise<void> {
  try {
    await getEmailProvider().send(message);
  } catch (e) {
    log.error("email delivery failed", { message: e instanceof Error ? e.message : String(e) });
  }
}
