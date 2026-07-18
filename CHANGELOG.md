# Akij Holidays — Changelog

## v9 (current) — Mobile print/PDF + Email PDF

Focused surgical release. Only mobile print/PDF and email-a-PDF added; the rest of the app (UI, layouts, workflows, calculations, styles) is untouched.

### 🛠️ Mobile Print & PDF — fixed

Previously the Print / PDF buttons were only reliable on desktop because both used `window.open("", "_blank")` — a pattern that mobile Safari and many Android browsers block, and that iOS silently fails to invoke `window.print()` on.

- **New mobile detection** (`_isMobile()`) — combines UA sniffing (`Mobi/Android/iPhone/iPad/iPod`) with a coarse-pointer + narrow-viewport check.
- **New mobile modal**: a fullscreen in-page overlay containing an iframe that hosts the identical A4 sheet. Two big buttons at the top:
  - **🖨 Print / Save PDF** — calls `iframe.contentWindow.print()` from a real user gesture, which iOS AirPrint and Android Chrome both honor. Users pick *Save to Files* (iOS) or *Save as PDF* (Android) to keep a copy.
  - **⬇ Download PDF** — generates a raster A4 PDF via `html2pdf.js` and hands it to the browser as an actual `.pdf` file, so users always have a downloadable option even when their mobile browser doesn't expose "Save as PDF" as a print destination.
  - **✕ Close** — dismisses the overlay.
- **Auto-fallback**: when the desktop popup is blocked, the same mobile modal is used, so the flow never dead-ends.
- **Zoom-friendly preview**: on <900 px screens the sheet inside the iframe is shown at `zoom: 0.55` (with a `transform: scale(.55)` fallback for Firefox), so the whole A4 page is visible without side-scroll. When the user prints, the CSS resets zoom to `1` so the actual print is at true A4.
- **Ticket barcodes** are still pre-materialised as SVG in the parent window before HTML is transferred, so QR & CODE-128 render perfectly on mobile too.
- Desktop behavior is untouched — same popup, same "Save as PDF" flow, same vector text output.

### ✉️ Email PDF

- New **✉️ Email PDF** button on every maker toolbar (Invoice, Voucher, Airline Ticket, Ticket Invoice). Sits between "PDF" and "Print" in the toolbar.
- Tapping it opens a compact in-page popover with:
  - **To** (email, required, validated)
  - **Cc** (optional, comma-separated)
  - **Subject** (auto-filled: `"Invoice INV-2026-0805 — Client Name"`, editable)
  - **Message** (auto-filled with a polite greeting + closing signature from `CFG.COMPANY.name`, editable)
- On **Send →**:
  1. The document is saved (locally + GitHub as usual).
  2. A raster A4 PDF blob is produced client-side via `html2pdf.js` — identical to the "Download PDF" fallback.
  3. The blob is base64-encoded and POSTed to the Google Apps Script Web App as `{ op: "email", to, cc, subject, message, filename, base64 }`.
  4. Apps Script's `MailApp.sendEmail(...)` sends the email with the PDF attachment.
- **Recipient / Cc are remembered per browser** (`akij.email.lastTo`, `akij.email.lastCC`) so repeat sends to the same client are one click.
- **Two-tier delivery**: primary `fetch` with CORS reads the JSON reply and surfaces exact success / failure. If CORS blocks the response body, a `mode: "no-cors"` beacon still delivers the payload.
- **Popover is mobile-friendly** — on <640 px it snaps to full-width at the top.
- **Requires**: same Apps Script `/exec` URL you use for Google Sheets logging (single endpoint handles both `op: "log"` and `op: "email"`). If not configured, the button surfaces a clear warning pointing to Settings.

### Google Apps Script (`google-apps-script.gs`)
- `doPost(e)` now dispatches on `data.op`:
  - `log` (default) → the existing sheet-append behaviour, unchanged.
  - `email` → the new `_sendEmail(data)` function.
- `_sendEmail` decodes the base64 PDF via `Utilities.base64Decode`, wraps it as a `Blob`, and calls `MailApp.sendEmail(to, subject, message, { attachments: [blob], name: "Akij Holidays" })`.
- Validates email address, accepts optional `cc`, `bcc`, `replyTo`, `from`.
- Returns `{ ok: true, sent }` on success or `{ ok: false, error }` on failure.

> **Deploy note:** if you already deployed the old Apps Script, redeploy the same project → **New deployment → Version: New** so the new `_sendEmail` handler is live. The Web App URL stays the same.

### QA
- 55 v9 assertions covering `_isMobile`, mobile modal wiring, iframe + `srcdoc` + `<base>` setup, native/raster/blob PDF paths, `Mailer` module, popover form, base64 encoding, `MailApp` integration in Apps Script, and per-maker Email PDF button + wiring. **55/55 pass.**
- v8 regression: **46/46 pass** — zero regressions on the previous release.
- All 6 JS modules + 7 inline HTML scripts syntax-clean.

---

## v8 — Setup once, works forever
- Settings page restored with GitHub + Google Sheets forms.
- Config precedence: browser localStorage first, then CFG.GITHUB fallback.
- Company address, phone, email, website in the doc header now hide-if-blank (no CFG fallback on rendered docs).
- Invoice bank details are now a repeater — add multiple bank accounts.

## v7 — Voucher polish + sync visibility
- Voucher hero: "Booking for", "From 15:00", "2N Duration" pill; Booking No/Date into header meta.
- Full Address + Phone header fields on every maker.
- Status dropdowns gained a "— None —" option.
- GitHub sync: `test()` preflight, clear error mapper, auto-sync on every dashboard load, 60-second refresh.

## v6 — GitHub sync rebuild + PDF vector export
- GitHub: hardcoded creds, folder layout `Invoice/Voucher/Other`, sticky `githubPath`, Git Trees API listing, bulk pull/push.
- PDF/Print: native `window.print()` via popup → vector, selectable, embedded fonts, identical to preview.

## v5 / v4 / v3 / v2 / v1
Earlier releases: invoice/voucher redesigns, monthly-reset numbering, dashboard Quick Create, smart ticket import, removal of receipt/quotation/visa pages, foundational bug audit + hardening.
