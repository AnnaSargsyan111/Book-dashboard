import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn(async () => ({}));
const createTransport = vi.fn(() => ({ sendMail }));
vi.mock("nodemailer", () => ({ default: { createTransport } }));

async function freshMailer() {
  vi.resetModules();
  return import("@/server/mail/mailer");
}

describe("email provider choice", () => {
  beforeEach(() => {
    sendMail.mockClear();
    createTransport.mockClear();
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
  });

  it("uses the console outside production when nothing is configured", async () => {
    const { getEmailProvider } = await freshMailer();
    expect(getEmailProvider().name).toBe("console");
  });

  it("sends through Gmail when GMAIL_USER and GMAIL_APP_PASSWORD are set, to any address, with html", async () => {
    process.env.GMAIL_USER = "shop@gmail.com";
    process.env.GMAIL_APP_PASSWORD = "abcd efgh ijkl mnop"; // Google shows App passwords with spaces
    const { getEmailProvider, sendEmail } = await freshMailer();
    expect(getEmailProvider().name).toBe("gmail");

    await sendEmail({ to: "friend@example.com", subject: "Hello", text: "plain", html: "<p>rich</p>" });
    expect(createTransport).toHaveBeenCalledWith({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: "shop@gmail.com", pass: "abcdefghijklmnop" } });
    expect(sendMail).toHaveBeenCalledWith({ from: "MystBook <shop@gmail.com>", to: "friend@example.com", subject: "Hello", text: "plain", html: "<p>rich</p>" });
  });

  it("prefers Gmail over Resend when both are configured", async () => {
    process.env.GMAIL_USER = "shop@gmail.com";
    process.env.GMAIL_APP_PASSWORD = "abcdefghijklmnop";
    process.env.RESEND_API_KEY = "re_x";
    process.env.EMAIL_FROM = "MystBook <hello@example.com>";
    const { getEmailProvider } = await freshMailer();
    expect(getEmailProvider().name).toBe("gmail");
  });

  it("does not let a failed send escape (the order must stay placed)", async () => {
    process.env.GMAIL_USER = "shop@gmail.com";
    process.env.GMAIL_APP_PASSWORD = "abcdefghijklmnop";
    sendMail.mockRejectedValueOnce(new Error("535 bad credentials"));
    const { sendEmail } = await freshMailer();
    await expect(sendEmail({ to: "friend@example.com", subject: "x", text: "y" })).resolves.toBeUndefined();
  });
});
