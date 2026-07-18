/**
 * Akij Holidays — Google Sheets logger (Apps Script)
 * ---------------------------------------------------
 * 1. Open your Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1EqWBeRUl7sYhU2Y16mv3DK57XWHTWSJbyv057J2epb8/edit
 * 2. Extensions → Apps Script → paste this entire file.
 * 3. Change SHEET_ID below if you want to log to a different sheet.
 * 4. Deploy → New deployment → type: Web app
 *      • Execute as: Me
 *      • Who has access: Anyone
 *    Copy the /exec URL.
 * 5. Paste that URL into config.js → APPS_SCRIPT_URL.
 *
 * How it works:
 * The web app receives POST requests from the browser with the mode
 * `no-cors`, which means the browser cannot read the response — but the
 * server still processes the payload and appends a row to the sheet.
 * A GET request returns a small JSON status so you can test in a browser.
 */

const SHEET_ID = "1EqWBeRUl7sYhU2Y16mv3DK57XWHTWSJbyv057J2epb8";

/* Columns written to each tab.  Missing keys → empty cell. */
const HEADERS = [
  "Timestamp", "Type", "ID", "Number", "Status",
  "Party", "Amount", "Currency", "PNR", "Ticket #",
  "Route", "Travel Date", "GitHub Path", "Updated At"
];

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) || "";
    if (!raw) return _json({ ok: false, error: "no body" });
    const data = JSON.parse(raw);

    // Route by op.  "log" is the default (backwards-compat).
    const op = String(data.op || "log").toLowerCase();
    if (op === "email") return _json(_sendEmail(data));
    if (op === "log" || op === "") { _appendRow(data); return _json({ ok: true }); }
    return _json({ ok: false, error: "unknown op: " + op });
  } catch (err) {
    return _json({ ok: false, error: err.message });
  }
}

/**
 * Email a document PDF attachment.
 * Expected payload:
 *   { op: "email", to, subject, message, filename, base64,
 *     cc?, bcc?, from? }
 * Returns { ok, sent, error? }.
 */
function _sendEmail(data) {
  const to = String(data.to || "").trim();
  if (!to) return { ok: false, error: "missing recipient" };
  if (!/^\S+@\S+\.\S+$/.test(to)) return { ok: false, error: "invalid email address" };

  const base64 = String(data.base64 || "");
  if (!base64) return { ok: false, error: "missing PDF content" };
  // Strip data-URL prefix if present
  const clean = base64.replace(/^data:application\/pdf;base64,/, "");
  let bytes;
  try { bytes = Utilities.base64Decode(clean); }
  catch (e) { return { ok: false, error: "invalid base64: " + e.message }; }

  const filename = String(data.filename || "document.pdf").replace(/[^\w.\-]/g, "_");
  const blob = Utilities.newBlob(bytes, "application/pdf", filename);

  const subject = String(data.subject || "Document from Akij Holidays");
  const message = String(data.message || "Please find your document attached.") +
    "\n\n—\nSent from Akij Holidays Travel Management System.";

  const options = { attachments: [blob], name: "Akij Holidays" };
  if (data.cc)  options.cc  = String(data.cc);
  if (data.bcc) options.bcc = String(data.bcc);
  if (data.from) options.from = String(data.from);
  if (data.replyTo) options.replyTo = String(data.replyTo);

  try {
    MailApp.sendEmail(to, subject, message, options);
    return { ok: true, sent: to };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function doGet(e) {
  // Health probe — visit the /exec URL in a browser to confirm deployment.
  return _json({
    ok: true,
    service: "Akij Holidays logger",
    sheet: SpreadsheetApp.openById(SHEET_ID).getName(),
    time: new Date().toISOString()
  });
}

function _appendRow(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const type = String(data.type || "misc");
  const tabName = _tabName(type);
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    // Style header row
    sheet.getRange(1, 1, 1, HEADERS.length)
         .setBackground("#8e011a")
         .setFontColor("#ffffff")
         .setFontWeight("bold");
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  const row = [
    new Date(),
    type,
    data.id || "",
    data.number || "",
    data.status || "",
    data.party || "",
    Number(data.amount) || "",
    data.currency || "",
    data.pnr || "",
    data.ticketNumber || "",
    data.route || "",
    data.travelDate || "",
    data.githubPath || "",
    data.updatedAt || ""
  ];
  sheet.appendRow(row);

  // De-dupe: if a row with the same ID already exists, delete the earlier one
  // so the latest write always wins.
  const id = data.id || "";
  if (id) {
    const last = sheet.getLastRow();
    const values = sheet.getRange(2, 3, Math.max(0, last - 1), 1).getValues(); // column C = ID
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 2);
        break;
      }
    }
  }
}

function _tabName(type) {
  const map = {
    invoice: "Invoices",
    voucher: "Vouchers",
    ticket: "Airline Tickets",
    ticketInvoice: "Ticket Invoices"
  };
  return map[type] || (type.charAt(0).toUpperCase() + type.slice(1));
}

function _json(o) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Test helper: run this from the Apps Script editor to verify sheet access. */
function testConnection() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Logger.log("Connected to sheet: " + ss.getName());
  _appendRow({
    type: "invoice",
    id: "test_" + Date.now(),
    number: "TEST-0001",
    status: "Draft",
    party: "Test Client",
    amount: 1234.56,
    currency: "BDT",
    pnr: "",
    ticketNumber: "",
    route: "",
    travelDate: "",
    githubPath: "",
    updatedAt: new Date().toISOString()
  });
  Logger.log("Test row written OK");
}
