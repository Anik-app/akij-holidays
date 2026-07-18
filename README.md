# 🌴 Akij Holidays — Travel Management System

A **production-grade OTA / travel-agency toolkit** built as a static web app. Deploy once, use anywhere: create polished **invoices, booking vouchers, money receipts, quotations, airline tickets, airline ticket invoices, and visa documents** with a live-preview editor, one-click **PDF export**, print-optimised layouts, and **centralised cloud storage via GitHub**.

Everything is plain HTML/CSS/JavaScript — no build step, no server, all files in the project root. Push to GitHub Pages / Netlify / Vercel or open `index.html` locally.

---

## ✨ Modules

| Module | File | What it does |
|--------|------|--------------|
| **Dashboard** | `index.html` | Enterprise sidebar layout, stats, quick-create tiles, recent-docs feed, cloud-status panel, dark/light mode |
| **All Documents** | `documents.html` | Merges local + GitHub records, tabs per type, search (number/name/PNR/passport/hotel), source filter, sort, backup/restore JSON |
| **Invoice Maker** | `invoice.html` | Line items, multi-currency (10), tax %/discount/fees, status pill, bank details, amount-in-words |
| **Voucher Maker** | `voucher.html` | Multi-hotel, guest info, room details, meal plan, adults/children/infants, auto-nights |
| **Money Receipt** | `receipt.html` | Payment method, cheque/bank ref, against-invoice link, amount in words |
| **Quotation Maker** | `quotation.html` | Trip subject, validity date, inclusions/exclusions, T&Cs |
| **Airline Ticket** | `ticket.html` | Airline + airport autocomplete (100+ airlines, 100+ airports, IATA/ICAO), multi-passenger, PNR/ticket#, class/cabin/fare basis, baggage, gate/terminal, **CODE128 barcode + QR** |
| **Ticket Invoice** | `ticket-invoice.html` | Base fare / taxes / VAT / service charge / discount / paid / due, imports data from any saved ticket, payment method, T&Cs |
| **Visa Document** | `visa.html` | Applicant + passport + destination + visa type/entry/duration, submitted-docs checklist |
| **Settings** | `settings.html` | Test GitHub token, save/clear credentials, view Google Sheets status |

---

## 🎯 Feature Highlights

### 🖨️ Print & PDF (both flawless)
- `@page { margin: 0 }` in the print window strips the browser's *"about:blank · 1/1"* headers/footers (works in Chrome/Edge — Firefox strips them if the user unchecks "Headers and footers")
- Footer banner is downscaled (max-width 220 px, ~35 % smaller than the original 300 px)
- Every document is wrapped in a strict A4 `.sheet` block with `page-break-after: always`
- PDF uses **html2pdf.js** with the identical layout so **PDF matches print exactly**, at scale 2× for crisp text/logos
- Barcode & QR are baked into the ticket sheet *before* PDF generation

### ☁️ Centralised cloud storage
- **GitHub Contents API** — save any generated document as `Documents/<Type>/YYYY/MM/<number>.json` in your repo
- Works cross-device: any browser signed into the app with the same token sees the same records
- Search & reopen documents straight from the GitHub folder (documents page tab: "GitHub only")
- Optional **Google Sheets** logging in parallel (Apps Script webhook)

### ✈️ Full aviation database
- **100+ major airlines** (IATA, ICAO, name, country) covering every carrier used out of Bangladesh
- **100+ major airports** with city/country/IATA/ICAO
- Live autocomplete with keyboard navigation
- Airline logos auto-loaded from a public CDN (`kiwi.com`) by IATA code

### 🎨 UI / UX
- Enterprise sidebar + top bar with global search
- Dark/light mode with system-friendly palette
- Live side-by-side preview on every maker
- Responsive down to phone width
- Modern cards, subtle shadows, smooth animations, professional colour palette (deep maroon + royal blue accent)

---

## 📁 Project Structure — flat, single directory

```
akij-holidays/
├── index.html              # Dashboard
├── documents.html          # All records (local + GitHub)
├── invoice.html
├── voucher.html
├── receipt.html
├── quotation.html
├── ticket.html
├── ticket-invoice.html
├── visa.html
├── settings.html
├── config.js               # Brand + cloud config (edit here)
├── app.js                  # Shared core: storage, GitHub API, print, PDF, autocomplete, theme
├── aviation-data.js        # Airlines + airports database
├── doc-renderers.js        # Single source of truth for every document's HTML
├── doc-actions.js          # Save / print / PDF wiring shared across makers
├── theme.css               # Shared theme (light + dark)
├── logo.png                # Company logo (used on paper)
├── banner.png              # Footer banner
├── google-apps-script.gs   # Google Sheets logger (paste into Apps Script)
└── README.md               # This file
```

**No `js/`, `css/`, or `assets/` subfolders** — everything sits together for the simplest possible deployment.

---

## 🚀 Deploy to GitHub Pages (2 minutes)

1. Create a repo on GitHub (public or private).
2. Upload every file in this folder to the repo root.
3. **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**.
4. Open the URL GitHub gives you.

Done. Every visitor with the same GitHub token (see below) will see the same cloud-stored documents.

---

## ☁️ Enable GitHub cloud storage (~2 min)

1. Create the same repo you're deploying to (or a separate one).
2. On GitHub go to **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**:
   - **Repository access → Only select repositories** → pick your repo.
   - **Repository permissions → Contents: Read and write**.
   - Copy the token (starts with `github_pat_…`).
3. Open the app → **⚙️ Settings** (sidebar) → paste owner, repo name, branch, base folder ("Documents"), and the token → **Save & Test**.
4. From now on, every save uploads `Documents/<Type>/<YYYY>/<MM>/<number>.json` to the repo.
5. Open the **All Documents** page → the source filter shows both **Local** and **GitHub** records; click the load icon on any cloud row to re-open it in the editor.

The token is stored **only in this browser's localStorage** and only transmitted to `api.github.com`.

---

## 📊 (Optional) Enable Google Sheets logging

1. Open your Google Sheet.
2. **Extensions → Apps Script** → paste the entire contents of `google-apps-script.gs` → Save.
3. **Deploy → New deployment → Web app** → Execute as: Me · Access: Anyone → Deploy.
4. Copy the URL → open `config.js` → paste into `APPS_SCRIPT_URL` → commit.

Now every save also appends a row to the corresponding tab: `Invoices`, `Vouchers`, `Receipts`, `Quotations`, `Airline Tickets`, `Airline Ticket Invoices`, `Visa Documents`, `Tour Documents`.

---

## 🖥️ Run locally

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Or just double-click `index.html`. Everything works offline (GitHub sync obviously requires internet).

---

## 🧠 How data flows on save

```
[Maker page]
    │
    ├─ 1. Save to localStorage        (always — instant, offline-safe)
    ├─ 2. Fire-and-forget → Google Sheets    (if APPS_SCRIPT_URL set)
    └─ 3. PUT JSON to GitHub Contents API    (if token configured)
```

If GitHub sync succeeds, the record gains `githubPath` / `syncedAt` fields and shows a "Synced" badge on the documents page.

---

## 🎛️ Customise defaults

Edit `config.js`:

```js
BRAND_NAME:    "Your Agency",
BRAND_PRIMARY: "#8e011a",
COMPANY: { name: "Your Company Ltd", phone: "…", email: "…", ... },
BANK:    { name: "Your Bank",       account: "…", number: "…", ... },
GITHUB:  { owner: "yourname", repo: "records", token: "github_pat_…" }
```

Everything is prefilled everywhere.

---

## 🧾 Tech stack

- Vanilla HTML + CSS + ES6 JavaScript (no framework)
- **html2pdf.js** for PDF generation
- **JsBarcode** for CODE-128 ticket barcodes
- **qrcodejs** for ticket QR codes
- **GitHub Contents API v3** for cloud storage
- **Google Apps Script** for Sheets logging
- **Google Fonts** — Poppins + JetBrains Mono

---

## 📝 License

Internal / private use for Akij Holidays. Fork freely for your own brand.
