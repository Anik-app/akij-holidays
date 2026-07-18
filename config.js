/* =========================================================
   Akij Holidays — Global Configuration (v5)
   ---------------------------------------------------------
   All modules read from window.APP_CONFIG.
   ========================================================= */
window.APP_CONFIG = {
  BRAND_NAME: "Akij Holidays",
  BRAND_TAGLINE: "Travel Management System",
  BRAND_PRIMARY: "#8e011a",
  BRAND_ACCENT: "#004aad",

  /* Google Apps Script Web-App URL — auto Google-Sheet logging. */
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxMZWpMRYnNrbaVPJVND2-nG5M9XtkJ0qHqTlRCqZ9Vb6s-7wsHOfG6WaN45InxTtXU/exec",

  /* Target Google Sheet (opened from Cloud page) */
  SHEET_URL: "https://docs.google.com/spreadsheets/d/1EqWBeRUl7sYhU2Y16mv3DK57XWHTWSJbyv057J2epb8/edit?usp=sharing",
  SHEET_ID: "1EqWBeRUl7sYhU2Y16mv3DK57XWHTWSJbyv057J2epb8",

  /* Company defaults — prefilled into each maker's Company Contact form.
     The renderer uses whatever the user leaves in those fields (they are
     editable per-document); config.js only supplies the defaults. */
  COMPANY: {
    name:     "AKIJ AIR SERVICES LTD",
    legalName:"AKIJ LOGISTICS LTD",
    address:  "Cosy Nook, House 10, Road 4, Gulshan 1, Dhaka, Bangladesh",
    phone:    "+880 9613 500850",
    email:    "holidays@akijair.com",
    website:  "www.akijair.com"
  },

  BANK: {
    name: "BRAC Bank PLC",
    account: "AKIJ LOGISTICS LTD",
    number: "2063890780001",
    branch: "Gulshan",
    routing: "060261726"
  },

  /* GitHub cloud storage — blank by default.
     Users configure once via Settings → credentials saved to browser
     localStorage and reused automatically on every subsequent load.
     (Optionally, put hardcoded fallback values here for on-premise
     deployments where every user should share the same creds.) */
  GITHUB: {
    owner:    "",
    repo:     "",
    branch:   "main",
    token:    "",
    basePath: "Documents"
  },

  /* Document types & folder mapping
     Folder names deliberately kept to the 3-bucket spec:
       Invoice / Voucher / Other  (tickets & ticket-invoices land in Other) */
  DOC_TYPES: {
    invoice:       { folder: "Invoice", label: "Invoice",                icon: "🧾", prefix: "INV" },
    voucher:       { folder: "Voucher", label: "Booking Voucher",        icon: "🎫", prefix: "BK"  },
    ticket:        { folder: "Other",   label: "Airline Ticket",         icon: "✈️", prefix: "TKT" },
    ticketInvoice: { folder: "Other",   label: "Airline Ticket Invoice", icon: "🛫", prefix: "ATI" }
  },

  /* Supported currencies */
  CURRENCIES: [
    { code: "BDT", symbol: "৳",   name: "Bangladeshi Taka" },
    { code: "USD", symbol: "$",   name: "US Dollar" },
    { code: "EUR", symbol: "€",   name: "Euro" },
    { code: "GBP", symbol: "£",   name: "Pound Sterling" },
    { code: "INR", symbol: "₹",   name: "Indian Rupee" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
    { code: "SAR", symbol: "﷼",   name: "Saudi Riyal" },
    { code: "SGD", symbol: "S$",  name: "Singapore Dollar" },
    { code: "THB", symbol: "฿",   name: "Thai Baht" },
    { code: "MYR", symbol: "RM",  name: "Malaysian Ringgit" }
  ]
};
