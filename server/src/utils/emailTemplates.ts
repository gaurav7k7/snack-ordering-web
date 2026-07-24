import { getOrCreateSiteSettings } from '../services/siteSettings.service.js';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Any user-supplied string (name, cancellation reason, etc.) interpolated
// into an email's HTML body must go through this first — emails are HTML
// documents rendered by a mail client, so an unescaped "<img onerror=...>"
// in, say, a registration name field is a live injection vector into
// outbound mail, not just a theoretical one.
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

// Company name/phone/email are admin-editable (Site Settings → Company
// Information) — fetched fresh on every send so the footer never drifts
// from what's currently configured, at the cost of one extra singleton
// lookup per email (negligible; each request sends at most one email).
export async function renderEmailHtml(title: string, bodyHtml: string) {
  const settings = await getOrCreateSiteSettings();
  const company = settings.company;
  const companyName = company?.name || 'Lotus Delight';
  const companyPhone = company?.phone || '+91 93415 02582';
  const companyEmail = company?.email || 'Lotusdelightproducts@gmail.com';

  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
    <div style="background: #16a34a; padding: 20px 24px; border-radius: 12px 12px 0 0;">
      <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">${escapeHtml(companyName)}</span>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 24px; color: #1f2937;">
      <h2 style="margin-top: 0; font-size: 18px;">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
      &copy; ${new Date().getFullYear()} ${escapeHtml(companyName)}. This is an automated message, please do not reply.<br />
      Need help? Call ${escapeHtml(companyPhone)} or email
      <a href="mailto:${escapeHtml(companyEmail)}" style="color: #9ca3af;">${escapeHtml(companyEmail)}</a>
    </p>
  </div>`;
}
