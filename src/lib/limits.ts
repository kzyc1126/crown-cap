/**
 * Upload size limits, shared by the client forms and the server actions.
 *
 * Trade request photos are e-mailed on as attachments, so the limit for them
 * is not one fixed number: mailboxes cap a whole *message*, not a file. Gmail
 * and most providers stop at 25 MB, and base64 encoding inflates every
 * attachment by about a third on the way out — so the raw bytes that can
 * safely ride along are well under that. One request may carry several photos,
 * and the budget is therefore split between them.
 */

/** Raw bytes of photos one trade request may carry, in total. */
export const MAIL_ATTACHMENT_BUDGET = 9 * 1024 * 1024; // ≈ 12 MB encoded

/** Admin uploads (cap photos, slideshow slides) are never e-mailed. */
export const ADMIN_IMAGE_MAX = 3 * 1024 * 1024;

/**
 * What one photo may weigh when `count` photos are being sent together.
 * Never drops below 512 KB — past that the form becomes unusable and the
 * visitor should be told to send fewer photos instead.
 */
export function photoBudget(count: number) {
  return Math.max(512 * 1024, Math.floor(MAIL_ATTACHMENT_BUDGET / Math.max(1, count)));
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1).replace(/\.0$/, "")} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}
