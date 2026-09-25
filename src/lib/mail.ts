import nodemailer, { type Transporter } from "nodemailer";
import { formatBytes } from "@/lib/limits";

/**
 * Outgoing mail. Configured entirely from .env; when the credentials are
 * missing nothing is sent and the message is written to the server console
 * instead, so the trade form keeps working on a machine that has no mail set
 * up. The request itself is always saved to the database first — mail is a
 * notification, never the record.
 *
 * Gmail needs an App Password (Google account → 2-Step Verification → App
 * passwords), not the account password.
 */
const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT ?? 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

/** Where trade requests are announced. */
export const notifyAddress = process.env.TRADE_NOTIFY_EMAIL ?? "kzyc26@gmail.com";

export const mailConfigured = Boolean(user && pass);

let cached: Transporter | null = null;

function transport() {
  if (!cached) {
    cached = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: user!, pass: pass! },
    });
  }
  return cached;
}

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

export type SendResult = { sent: boolean; detail: string };

export async function sendMail({
  subject,
  text,
  html,
  attachments = [],
  replyTo,
}: {
  subject: string;
  text: string;
  html: string;
  attachments?: MailAttachment[];
  replyTo?: string;
}): Promise<SendResult> {
  if (!mailConfigured) {
    console.warn(
      `[mail] SMTP_USER / SMTP_PASS are not set — nothing sent.\n` +
        `       To: ${notifyAddress}\n       Subject: ${subject}\n` +
        `       Attachments: ${attachments.length}\n\n${text}\n`,
    );
    return { sent: false, detail: "SMTP credentials are not configured." };
  }

  try {
    const info = await transport().sendMail({
      from: process.env.SMTP_FROM ?? `"Filip’s Caps" <${user}>`,
      to: notifyAddress,
      replyTo,
      subject,
      text,
      html,
      attachments,
    });
    return { sent: true, detail: String(info.messageId ?? "sent") };
  } catch (error) {
    // A refused mail must not lose the request, so this is reported, not thrown.
    console.error("[mail] send failed:", error);
    return { sent: false, detail: (error as Error).message };
  }
}

// ------------------------------------------------------- trade request mail

export type TradeMailItem = {
  /** the cap being asked for */
  wants: { name: string; ref: string; country: string; year: number | null };
  /** the wishlist cap offered back, when one was chosen */
  offersCap: { name: string; country: string } | null;
  /** the cap described in the form, when "Other" was chosen */
  offersNew: { name: string; specs: Array<[string, string]> } | null;
  /** anything else they added */
  offersNote: string | null;
  photo: MailAttachment | null;
};

const escape = (value: string) =>
  value.replace(/[&<>"]/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] as string,
  );

/**
 * Lays the request out the way /admin/requests shows it: who is asking, how to
 * reach them, then one block per cap — what they want above what they offer.
 */
export function tradeRequestMail({
  name,
  contact,
  items,
  sentAt,
}: {
  name: string;
  contact: string;
  items: TradeMailItem[];
  sentAt: Date;
}) {
  const when = sentAt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  /* One line naming the offered cap, whichever way it was offered. */
  const offerLine = (item: TradeMailItem) => {
    if (item.offersCap)
      return `${item.offersCap.name} · ${item.offersCap.country} (on your wishlist)`;
    if (item.offersNew)
      return [item.offersNew.name, ...item.offersNew.specs.map(([, v]) => v)].join(
        " · ",
      );
    return item.offersNote || "—";
  };

  const caps = items.length === 1 ? "1 cap" : `${items.length} caps`;
  const subject = `Trade request from ${name} — ${caps}`;

  const text = [
    `${name}`,
    `${contact} · ${when}`,
    "",
    ...items.flatMap((item, index) => [
      `${index + 1}. WANTS  ${item.wants.name}`,
      `           ${item.wants.ref} · ${item.wants.country} · ${item.wants.year}`,
      `   OFFERS  ${offerLine(item)}`,
      ...(item.offersNew
        ? item.offersNew.specs.map(
            ([key, value]) => `           ${key.padEnd(14)}${value}`,
          )
        : []),
      ...(item.offersNote ? [`   NOTE    ${item.offersNote}`] : []),
      ...(item.photo
        ? [
            `   PHOTO   ${item.photo.filename} ` +
              `(${formatBytes(item.photo.content.length)}, attached)`,
          ]
        : []),
      "",
    ]),
    `Reply to ${contact}, or open http://localhost:3000/admin/requests`,
  ].join("\n");

  const blocks = items
    .map(
      (item) => `
      <tr><td style="padding:0 0 18px">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d9d4c9">
          <tr><td style="padding:16px 18px">
            <div style="font:600 10px/1 system-ui;letter-spacing:.14em;text-transform:uppercase;color:#8a8579">Wants</div>
            <div style="font:400 20px/1.3 Georgia,serif;color:#1b1a17;margin-top:4px">${escape(item.wants.name)}</div>
            <div style="font:400 13px/1.5 system-ui;color:#6f6a5f">${escape(item.wants.ref)} · ${escape(item.wants.country)} · ${item.wants.year}</div>
            <div style="font:600 10px/1 system-ui;letter-spacing:.14em;text-transform:uppercase;color:#8a8579;margin-top:16px">Offers</div>
            <div style="font:400 15px/1.55 system-ui;color:#1b1a17;margin-top:4px">${escape(
              item.offersNew ? item.offersNew.name : offerLine(item),
            )}</div>
            ${
              item.offersNew && item.offersNew.specs.length
                ? `<table cellpadding="0" cellspacing="0" style="margin-top:8px">${item.offersNew.specs
                    .map(
                      ([key, value]) =>
                        `<tr><td style="font:600 10px/1.6 system-ui;letter-spacing:.1em;text-transform:uppercase;color:#8a8579;padding-right:14px;vertical-align:top">${escape(key)}</td><td style="font:400 13px/1.6 system-ui;color:#1b1a17">${escape(value)}</td></tr>`,
                    )
                    .join("")}</table>`
                : ""
            }
            ${
              item.offersNote
                ? `<div style="font:400 13px/1.55 system-ui;color:#6f6a5f;margin-top:10px">${escape(item.offersNote)}</div>`
                : ""
            }
            ${
              item.photo
                ? `<div style="font:400 12px/1.5 system-ui;color:#6f6a5f;margin-top:10px">Photo attached — ${escape(item.photo.filename)} (${formatBytes(item.photo.content.length)})</div>`
                : ""
            }
          </td></tr>
        </table>
      </td></tr>`,
    )
    .join("");

  const html = `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ec;padding:28px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
      <tr><td style="padding:0 0 22px">
        <div style="font:600 10px/1 system-ui;letter-spacing:.16em;text-transform:uppercase;color:#1f9c96">New trade request</div>
        <div style="font:400 28px/1.2 Georgia,serif;color:#1b1a17;margin-top:8px">${escape(name)}</div>
        <div style="font:400 13px/1.5 system-ui;color:#6f6a5f;margin-top:4px">${escape(contact)} · ${when}</div>
      </td></tr>
      ${blocks}
      <tr><td style="padding:6px 0 0;font:400 13px/1.6 system-ui;color:#6f6a5f">
        Reply straight to ${escape(contact)}, or open the
        <a href="http://localhost:3000/admin/requests" style="color:#1f9c96">request inbox</a>.
      </td></tr>
    </table>
  </td></tr>
</table>`;

  return { subject, text, html };
}
