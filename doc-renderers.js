/* =========================================================
   Akij Holidays — Document Renderers (v4 Production Build)
   ---------------------------------------------------------
   v4 changes:
   • Doc header shows LOGO ONLY (no company address text).
   • Invoice: pro-designed "Payment Information" band below totals.
   • Voucher: elegant redesign with hero band + beautiful hotel cards.
   • Removed renderers: receipt, quotation, visa.

   Rules honoured everywhere:
   • If a field is blank/undefined/null → the row is HIDDEN.
   • No "N/A", "undefined", "null", empty labels, blank rows.
   • Every document ends with the computer-generated footer.
   • All text is real, selectable HTML text.
   ========================================================= */
(function (global) {
  "use strict";

  const A = global.AkijApp;
  if (!A) { console.error("AkijApp not loaded"); return; }
  const { CFG, formatMoney, formatNumber, formatDate, escapeHTML, symbolFor, isBlank } = A;
  const esc = escapeHTML;

  /* ---------- Shared paper CSS ---------- */
  const COMMON_CSS = `
    .sheet { color: #333; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; line-height: 1.5; }
    .sheet * { box-sizing: border-box; }

    /* Header — logo + editable email/website on LEFT, doc title on RIGHT,
       both vertically centered against the shared baseline. */
    .sheet .h {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 2px solid #8e011a;
      margin-bottom: 22px;
      gap: 20px;
    }
    /* Company block: logo on top, contact stacked BELOW the logo. */
    .sheet .h .co-block { flex: 1 1 auto; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; min-width: 0; }
    .sheet .h .co-logo { height: 74px; width: auto; display: block; flex-shrink: 0; }
    .sheet .h .co-contact { min-width: 0; max-width: 340px; }
    .sheet .h .co-contact p { margin: 1px 0; font-size: 11px; color: #555; line-height: 1.45; }
    .sheet .h .co-contact p .lab { color: #8e011a; font-weight: 600; letter-spacing: .02em; margin-right: 2px; }
    .sheet .h .co-contact p.co-addr { color: #333; font-size: 11px; font-weight: 500; max-width: 320px; }
    .sheet .h .doc-title { text-align: right; flex-shrink: 0; align-self: center; }
    .sheet .h .doc-title h2 { margin: 0; color: #8e011a; font-weight: 800; font-size: 30px; letter-spacing: -.02em; line-height: 1.05; }
    .sheet .h .doc-title .subline { font-size: 11px; color: #666; margin-top: 4px; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; }
    .sheet .h .doc-title .doc-meta { margin-top: 6px; font-size: 11px; color: #444; line-height: 1.55; font-weight: 500; }
    .sheet .h .doc-title .doc-meta .k { color: #8e011a; font-weight: 700; letter-spacing: .02em; margin-right: 4px; text-transform: none; }
    .sheet .h .doc-title .doc-meta .v { font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 700; color: #222; }

    /* Voucher gets slightly reduced logo + heading */
    .sheet.compact-h .h .co-logo { height: 60px; }
    .sheet.compact-h .h .doc-title h2 { font-size: 24px; }

    /* Section titles */
    .sheet h3.section {
      color: #8e011a;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: .06em;
      margin: 18px 0 10px;
      font-weight: 700;
      padding-bottom: 4px;
      border-bottom: 1px solid rgba(142,1,26,.18);
    }

    /* Key/value grid */
    .sheet .kv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 6px 0 10px; }
    .sheet .kv-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
    .sheet .kv { background: #f7f8fa; border: 1px solid #e6e8ec; border-radius: 8px; padding: 8px 11px; }
    .sheet .kv .k { font-size: 9.5px; color: #8e011a; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .sheet .kv .v { font-size: 12.5px; font-weight: 600; color: #333; margin-top: 2px; word-break: break-word; }

    /* Detail rows */
    .sheet .row-det { display: flex; margin: 6px 0; font-size: 12px; align-items: flex-start; }
    .sheet .row-det .lbl { width: 150px; color: #8e011a; font-weight: 600; text-align: right; padding-right: 12px; flex-shrink: 0; font-size: 10.5px; text-transform: uppercase; letter-spacing: .03em; padding-top: 1px; }
    .sheet .row-det .val { flex: 1; padding-left: 10px; color: #333; word-break: break-word; border-left: 2px solid #f0e0e4; }

    /* Party (bill-to / details columns) */
    .sheet .party-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 8px 0 4px; }
    .sheet .party { min-width: 0; }
    .sheet .party h3 { margin: 0 0 8px; color: #8e011a; font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
    .sheet .party p { margin: 2px 0; font-size: 12px; line-height: 1.55; color: #333; word-break: break-word; }
    .sheet .party p.name { font-weight: 700; font-size: 13.5px; color: #222; margin-bottom: 4px; }
    .sheet .party p .lab { color: #666; font-weight: 500; }

    /* Items table */
    .sheet table.items { width: 100%; border-collapse: collapse; font-size: 11.5px; margin: 8px 0 10px; page-break-inside: auto; }
    .sheet table.items thead { display: table-header-group; }
    .sheet table.items tr { page-break-inside: avoid; }
    .sheet table.items th { background: linear-gradient(135deg, #8e011a 0%, #6a0114 100%); color: #fff; padding: 10px 12px; text-align: right; font-weight: 600; font-size: 10.5px; text-transform: uppercase; letter-spacing: .05em; }
    .sheet table.items th:first-child, .sheet table.items td:first-child { text-align: left; }
    .sheet table.items th.left, .sheet table.items td.left { text-align: left; }
    .sheet table.items td { padding: 9px 12px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top; }
    .sheet table.items tr:nth-child(even) td { background: #fafafa; }
    .sheet table.items td.num { font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 500; }

    /* Totals */
    .sheet .totals { display: flex; justify-content: flex-end; margin-top: 8px; page-break-inside: avoid; }
    .sheet .totals table { border-collapse: collapse; min-width: 300px; }
    .sheet .totals table td { padding: 6px 14px; font-size: 12px; text-align: right; font-variant-numeric: tabular-nums; }
    .sheet .totals .label { color: #555; font-weight: 600; text-align: left !important; padding-right: 32px; }
    .sheet .totals .grand td { color: #8e011a; font-weight: 800; font-size: 15px; border-top: 2px solid #8e011a; padding-top: 10px; }
    .sheet .totals.stretch { justify-content: stretch; }
    .sheet .totals.stretch table { width: 100%; }

    /* Notes / Terms / Callouts */
    .sheet .notes { margin-top: 14px; padding: 11px 14px; background: #fdf2f4; border: 1px solid rgba(142,1,26,.22); border-left: 3px solid #8e011a; border-radius: 6px; font-size: 11.5px; page-break-inside: avoid; }
    .sheet .notes strong { color: #8e011a; }
    .sheet .terms { margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(142,1,26,.2); font-size: 11px; color: #555; line-height: 1.6; white-space: pre-wrap; page-break-inside: avoid; }
    .sheet .terms strong { color: #8e011a; display: block; margin-bottom: 4px; }

    /* ============ Payment / Bank Info — typography-only, no colored box ============ */
    .sheet .bank-card {
      margin-top: 16px;
      padding-top: 10px;
      border-top: 1px solid rgba(142, 1, 26, .3);
      page-break-inside: avoid;
    }
    .sheet .bank-card .bank-head {
      color: #8e011a;
      padding: 0 0 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .1em;
    }
    .sheet .bank-card .bank-head .ico { font-size: 13px; margin-right: 6px; }
    .sheet .bank-card .bank-head .cur { color: #666; font-weight: 600; letter-spacing: .05em; }
    .sheet .bank-card .bank-body {
      padding: 4px 0 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px 26px;
    }
    .sheet .bank-card .bank-body .bank-field { min-width: 0; padding: 2px 0; }
    .sheet .bank-card .bank-body .bank-field .bk { font-size: 9.5px; color: #8e011a; text-transform: uppercase; letter-spacing: .05em; font-weight: 700; margin-bottom: 1px; }
    .sheet .bank-card .bank-body .bank-field .bv { font-size: 12px; color: #222; font-weight: 600; font-family: 'JetBrains Mono', ui-monospace, monospace; word-break: break-word; }
    .sheet .bank-card .bank-body .bank-field.name .bv { font-family: 'Poppins', sans-serif; }
    /* Multi-bank blocks: each bank body carries a small header + a dashed divider between banks. */
    .sheet .bank-card .bank-body.bank-multi { position: relative; padding-top: 8px; }
    .sheet .bank-card .bank-body.bank-multi + .bank-body.bank-multi { border-top: 1px dashed rgba(142, 1, 26, .18); margin-top: 6px; padding-top: 10px; }
    .sheet .bank-card .bank-body .bank-idx { grid-column: 1 / -1; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; color: #8e011a; margin-bottom: 2px; }
    .sheet .bank-card .bank-note {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed rgba(142, 1, 26, .15);
      font-size: 10.5px;
      color: #666;
      font-style: italic;
      line-height: 1.5;
    }

    /* ============ Invoice details compact panel (right of Bill To) ============ */
    .sheet .inv-panel {
      border: 1px solid rgba(142,1,26,.22);
      border-radius: 10px;
      overflow: hidden;
    }
    .sheet .inv-panel .inv-row { display: flex; justify-content: space-between; padding: 8px 12px; font-size: 12px; border-bottom: 1px solid rgba(142,1,26,.10); }
    .sheet .inv-panel .inv-row:last-child { border-bottom: none; }
    .sheet .inv-panel .inv-row .k { color: #8e011a; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; font-size: 10.5px; align-self: center; }
    .sheet .inv-panel .inv-row .v { color: #222; font-weight: 700; font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: .01em; text-align: right; }
    .sheet .inv-panel .inv-row.status .v { font-family: 'Poppins', sans-serif; }

    /* ============ Voucher hero band (no background, standout via typography) ============ */
    .sheet .voucher-hero {
      margin: 8px 0 18px;
      border-radius: 14px;
      overflow: hidden;
      background: #ffffff;
      page-break-inside: avoid;
      border: 1px solid rgba(142, 1, 26, .22);
      box-shadow: 0 3px 12px rgba(15, 20, 40, .05);
    }
    /* Header strip: NO fill, standout via typography + a thin accent bar on the left */
    .sheet .voucher-hero .vh-band {
      background: #ffffff;
      color: #1f2937;
      padding: 14px 20px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      border-bottom: 1px solid rgba(142, 1, 26, .12);
      position: relative;
    }
    .sheet .voucher-hero .vh-band::before {
      content: ""; position: absolute; left: 0; top: 12px; bottom: 12px;
      width: 4px; background: linear-gradient(180deg, #8e011a, #d81a3f);
      border-radius: 0 3px 3px 0;
    }
    .sheet .voucher-hero .vh-band > div:first-child { padding-left: 14px; }
    .sheet .voucher-hero .vh-band .vh-title { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; color: #8e011a; }
    .sheet .voucher-hero .vh-band .vh-guest { font-size: 22px; font-weight: 800; letter-spacing: -.015em; margin-top: 3px; color: #1f2937; line-height: 1.15; }
    .sheet .voucher-hero .vh-band .vh-right { text-align: right; font-size: 11.5px; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
    .sheet .voucher-hero .vh-band .vh-right .vh-code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 15px; font-weight: 800; letter-spacing: .04em; color: #8e011a; }
    .sheet .voucher-hero .vh-band .vh-right .vh-service {
      display: inline-block; padding: 3px 10px; border-radius: 999px;
      background: rgba(142,1,26,.08); color: #8e011a;
      font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
    }
    .sheet .voucher-hero .vh-timeline { display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; padding: 18px 24px; align-items: center; background: #fff; }
    .sheet .voucher-hero .vh-timeline .vh-side { min-width: 0; }
    .sheet .voucher-hero .vh-timeline .vh-side .vh-lbl { font-size: 10px; color: #8e011a; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; }
    .sheet .voucher-hero .vh-timeline .vh-side .vh-date { font-size: 20px; font-weight: 800; color: #1f2937; margin-top: 3px; line-height: 1.1; letter-spacing: -.01em; }
    .sheet .voucher-hero .vh-timeline .vh-side .vh-sub { font-size: 11px; color: #666; margin-top: 4px; font-weight: 500; }
    .sheet .voucher-hero .vh-timeline .vh-side.right { text-align: right; }
    .sheet .voucher-hero .vh-timeline .vh-mid { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 0 8px; }
    .sheet .voucher-hero .vh-timeline .vh-mid .vh-duration {
      display: inline-flex; align-items: baseline; gap: 6px;
      padding: 6px 14px; border-radius: 999px;
      background: linear-gradient(135deg, #8e011a 0%, #b0032a 100%); color: #fff;
      box-shadow: 0 2px 6px rgba(142, 1, 26, .28);
    }
    .sheet .voucher-hero .vh-timeline .vh-mid .vh-duration .n { font-size: 15px; font-weight: 800; letter-spacing: -.01em; }
    .sheet .voucher-hero .vh-timeline .vh-mid .vh-duration .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; opacity: .95; }
    .sheet .voucher-hero .vh-timeline .vh-mid .vh-arrow { font-size: 22px; opacity: .35; line-height: 1; margin-top: 4px; color: #8e011a; }
    .sheet .voucher-hero .vh-stats { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px dashed rgba(142, 1, 26, .18); }
    .sheet .voucher-hero .vh-stats .vh-stat { padding: 11px 14px; text-align: center; border-right: 1px dashed rgba(142, 1, 26, .12); }
    .sheet .voucher-hero .vh-stats .vh-stat:last-child { border-right: none; }
    .sheet .voucher-hero .vh-stats .vh-stat .vh-stat-v { font-size: 18px; font-weight: 800; color: #8e011a; line-height: 1; letter-spacing: -.01em; }
    .sheet .voucher-hero .vh-stats .vh-stat .vh-stat-k { font-size: 9.5px; color: #666; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; margin-top: 4px; }

    /* ============ Hotel cards (voucher — most prominent section) ============ */
    .sheet .hotels-block { margin-top: 6px; }
    .sheet .hotel-card {
      background: #ffffff;
      border: 1px solid rgba(142, 1, 26, .22);
      border-radius: 12px;
      margin-bottom: 12px;
      overflow: hidden;
      page-break-inside: avoid;
      box-shadow: 0 2px 8px rgba(15, 20, 40, .06);
    }
    .sheet .hotel-card .hc-head {
      background: linear-gradient(135deg, #fdf2f4 0%, #fff 60%);
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      border-bottom: 1px solid rgba(142, 1, 26, .14);
    }
    .sheet .hotel-card .hc-head .hc-icon {
      width: 42px; height: 42px;
      border-radius: 10px;
      background: linear-gradient(135deg, #8e011a, #b0032a);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      flex-shrink: 0;
      box-shadow: 0 3px 8px rgba(142,1,26,.28);
    }
    .sheet .hotel-card .hc-head .hc-title { flex: 1; min-width: 0; }
    .sheet .hotel-card .hc-head .hc-title .hc-name {
      font-size: 18px;
      font-weight: 800;
      color: #8e011a;
      line-height: 1.2;
      letter-spacing: -.015em;
      margin-bottom: 2px;
    }
    .sheet .hotel-card .hc-head .hc-title .hc-loc {
      font-size: 11.5px; color: #555; margin-top: 3px;
      font-weight: 500; display: flex; align-items: center; gap: 5px;
    }
    .sheet .hotel-card .hc-head .hc-title .hc-loc::before { content: "📍"; font-size: 10px; opacity: .85; }
    .sheet .hotel-card .hc-head .hc-stars { color: #f59f00; font-size: 14px; letter-spacing: 1.5px; flex-shrink: 0; font-weight: 700; }
    .sheet .hotel-card .hc-body {
      padding: 12px 18px 14px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px 18px;
    }
    .sheet .hotel-card .hc-body .hc-field { min-width: 0; }
    .sheet .hotel-card .hc-body .hc-field .hk { font-size: 9.5px; color: #8e011a; text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
    .sheet .hotel-card .hc-body .hc-field .hv { font-size: 12.5px; color: #333; font-weight: 600; margin-top: 2px; word-break: break-word; }
    .sheet .hotel-card .hc-body .hc-field .hv.mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }

    /* Guest info — elegant border-only style, no background */
    .sheet .guest-block {
      margin-top: 4px;
      border: 1px solid rgba(142, 1, 26, .18);
      border-radius: 10px;
      padding: 12px 16px 6px;
      page-break-inside: avoid;
    }
    .sheet .guest-block .gb-head {
      font-size: 10.5px; color: #8e011a; text-transform: uppercase; letter-spacing: .06em;
      font-weight: 700; padding-bottom: 6px; border-bottom: 1px dashed rgba(142,1,26,.18); margin-bottom: 8px;
    }
    .sheet .guest-block .gb-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 24px; }
    .sheet .guest-block .gb-item {
      display: flex; align-items: baseline; gap: 8px; padding: 4px 0;
      font-size: 12.5px;
    }
    .sheet .guest-block .gb-item .gi-tag {
      font-size: 9.5px; color: #8e011a; font-weight: 700;
      text-transform: uppercase; letter-spacing: .04em; min-width: 62px;
    }
    .sheet .guest-block .gb-item .gi-name { color: #222; font-weight: 600; }
    .sheet .guest-block .gb-meta { margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(142,1,26,.15);
      display: flex; flex-wrap: wrap; gap: 4px 22px; font-size: 11.5px; color: #555; }
    .sheet .guest-block .gb-meta .m-k { color: #8e011a; font-weight: 700; margin-right: 4px; }

    /* Status pill */
    .sheet .status-pill { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
    .sheet .status-CONFIRMED { background: #dcfce7; color: #166534; }
    .sheet .status-PENDING   { background: #fef3c7; color: #92400e; }
    .sheet .status-CANCELLED { background: #fee2e2; color: #991b1b; }
    .sheet .status-HOLD      { background: #e0e7ff; color: #3730a3; }
    .sheet .status-PAID      { background: #dcfce7; color: #166534; }
    .sheet .status-DRAFT     { background: #e5e7eb; color: #374151; }
    .sheet .status-SENT      { background: #dbeafe; color: #1e40af; }
    .sheet .status-OVERDUE   { background: #fee2e2; color: #991b1b; }
    .sheet .status-DEFAULT   { background: #e5e7eb; color: #374151; }

    /* Amount in words */
    .sheet .amount-in-words { margin-top: 10px; padding: 9px 14px; background: #f7f8fa; border-left: 3px solid #8e011a; font-size: 11.5px; font-style: italic; color: #444; border-radius: 4px; page-break-inside: avoid; }
    .sheet .amount-in-words strong { font-style: normal; color: #333; }

    /* Ticket-specific */
    .sheet .ticket-stub { border: 2px solid #8e011a; border-radius: 12px; overflow: hidden; margin: 12px 0; page-break-inside: avoid; background: #fff; box-shadow: 0 2px 8px rgba(15, 20, 40, .05); }
    .sheet .ticket-band { background: linear-gradient(135deg, #8e011a 0%, #6a0114 100%); color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; gap: 12px; }
    .sheet .ticket-band .airline { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 14px; min-width: 0; }
    .sheet .ticket-band .airline img { height: 28px; width: auto; background: #fff; border-radius: 4px; padding: 2px 4px; flex-shrink: 0; }
    .sheet .ticket-band .airline span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sheet .ticket-band .flight-code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 16px; font-weight: 700; letter-spacing: .05em; white-space: nowrap; }
    .sheet .ticket-body { display: grid; grid-template-columns: 1fr 1px 1fr; padding: 16px 18px; gap: 14px; background: #fff; }
    .sheet .ticket-body .divider { background: repeating-linear-gradient(to bottom, #ccc 0, #ccc 4px, transparent 4px, transparent 8px); width: 1px; align-self: stretch; }
    .sheet .ticket-body .side .code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 34px; font-weight: 800; color: #8e011a; line-height: 1; letter-spacing: .02em; }
    .sheet .ticket-body .side .city { color: #555; font-size: 12px; margin-top: 4px; font-weight: 600; }
    .sheet .ticket-body .side .airport { color: #333; font-size: 11px; margin-top: 2px; }
    .sheet .ticket-body .side .datetime { margin-top: 10px; font-weight: 700; font-size: 13px; color: #333; }
    .sheet .ticket-body .side .datetime small { font-weight: 500; color: #666; font-size: 10.5px; display: block; margin-top: 3px; }
    .sheet .ticket-body .side.right { text-align: right; }
    .sheet .ticket-meta { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; background: #fafafa; padding: 12px 18px; border-top: 1px dashed #ccc; }
    .sheet .ticket-meta .cell .k { font-size: 9px; color: #8e011a; text-transform: uppercase; letter-spacing: .04em; font-weight: 700; }
    .sheet .ticket-meta .cell .v { font-size: 11.5px; font-weight: 600; color: #333; margin-top: 1px; word-break: break-word; }
    .sheet .ticket-codes { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 14px 18px; border-top: 1px dashed #ccc; background: #fff; }
    .sheet .ticket-codes .barcode { flex: 1; min-width: 0; }
    .sheet .ticket-codes .barcode svg { width: 100%; max-width: 380px; height: 46px; display: block; }
    .sheet .ticket-codes .qr { flex-shrink: 0; }
    .sheet .ticket-codes .qr img, .sheet .ticket-codes .qr canvas { width: 72px !important; height: 72px !important; }
    .sheet .ticket-codes .qr:empty::after { content: ""; display: inline-block; width: 72px; height: 72px; background: repeating-linear-gradient(45deg, #eee 0 6px, #f6f6f6 6px 12px); border-radius: 4px; }
  `;

  /* ---------- Header ----------
     Left column: company logo + optional contact block STACKED BELOW the logo.
                  Each contact field is shown ONLY if the user typed something.
                  No CFG fallback — blank means hidden.
     Right column: doc title + optional docMeta rows (e.g. Booking No, Booking Date).
     Fields come from r.headerAddress / r.headerPhone / r.headerEmail / r.headerWebsite. */
  function header(docTitle, opts = {}) {
    const co = CFG.COMPANY || {};
    const address = opts.address;
    const phone   = opts.phone;
    const email   = opts.email;
    const website = opts.website;
    const subline = !isBlank(opts.subline) ? opts.subline : "";
    const docMeta = Array.isArray(opts.docMeta) ? opts.docMeta.filter(x => x && !isBlank(x.value)) : [];

    const contactHTML = (isBlank(email) && isBlank(website) && isBlank(address) && isBlank(phone)) ? "" : `
      <div class="co-contact">
        ${!isBlank(address) ? `<p class="co-addr">${esc(address)}</p>` : ""}
        ${!isBlank(phone)   ? `<p><span class="lab">Phone:</span> ${esc(phone)}</p>` : ""}
        ${!isBlank(email)   ? `<p><span class="lab">Email:</span> ${esc(email)}</p>` : ""}
        ${!isBlank(website) ? `<p><span class="lab">Web:</span> ${esc(website)}</p>` : ""}
      </div>`;

    const metaHTML = docMeta.length ? `
      <div class="doc-meta">
        ${docMeta.map(m => `<div><span class="k">${esc(m.label)}:</span><span class="v">${esc(m.value)}</span></div>`).join("")}
      </div>` : "";

    return `
      <div class="h">
        <div class="co-block">
          <img src="logo.png" class="co-logo" alt="${esc(co.name || "Logo")}" onerror="this.style.display='none'"/>
          ${contactHTML}
        </div>
        <div class="doc-title">
          <h2>${esc(docTitle)}</h2>
          ${!isBlank(subline) ? `<div class="subline">${esc(subline)}</div>` : ""}
          ${metaHTML}
        </div>
      </div>`;
  }

  function footer() {
    const name = CFG.COMPANY?.name || "AKIJ Air Services Ltd";
    return `<div class="doc-footer"><img src="banner.png" onerror="this.style.display='none'" alt="footer banner"/><p>This is a computer-generated document from ${esc(name)}.</p></div>`;
  }

  function statusPill(status) {
    if (isBlank(status)) return "";
    const s = String(status).toUpperCase();
    const key = s.replace(/[^A-Z]/g, "");
    let cls;
    if (/CONFIRMED|PAID|OK/.test(key)) cls = "status-CONFIRMED";
    else if (/PENDING/.test(key)) cls = "status-PENDING";
    else if (/CANCELLED|CANCEL|EXPIRED/.test(key)) cls = "status-CANCELLED";
    else if (/HOLD/.test(key)) cls = "status-HOLD";
    else if (/DRAFT/.test(key)) cls = "status-DRAFT";
    else if (/SENT|DELIVERED/.test(key)) cls = "status-SENT";
    else if (/OVERDUE/.test(key)) cls = "status-OVERDUE";
    else cls = "status-DEFAULT";
    return `<span class="status-pill ${cls}">${esc(status)}</span>`;
  }

  function row(label, val, opts = {}) {
    if (isBlank(val)) return "";
    const html = opts.raw ? val : esc(val).replace(/\n/g, "<br>");
    return `<div class="row-det"><div class="lbl">${esc(label)}</div><div class="val">${html}</div></div>`;
  }
  function line(val, opts = {}) {
    if (isBlank(val)) return "";
    if (opts.label) return `<p><span class="lab">${esc(opts.label)}:</span> ${opts.strong ? `<strong>${esc(val)}</strong>` : esc(val)}</p>`;
    return `<p${opts.name ? ' class="name"' : ""}>${opts.strong ? `<strong>${esc(val)}</strong>` : esc(val)}</p>`;
  }
  function kv(k, v) {
    if (isBlank(v)) return "";
    return `<div class="kv"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`;
  }

  /* ---------- Amount-to-words ---------- */
  function numToWords(num) {
    let n = Math.round(Number(num) || 0);
    if (n === 0) return "Zero";
    const neg = n < 0; if (neg) n = -n;
    const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    const scale = ["", "Thousand", "Million", "Billion", "Trillion"];
    const chunk = (v) => {
      let s = "";
      if (v >= 100) { s += a[Math.floor(v/100)] + " Hundred "; v %= 100; }
      if (v >= 20) { s += b[Math.floor(v/10)] + (v%10 ? "-" + a[v%10] : "") + " "; }
      else if (v > 0) { s += a[v] + " "; }
      return s.trim();
    };
    let i = 0, out = "";
    while (n > 0) {
      const c = n % 1000;
      if (c) out = chunk(c) + (scale[i] ? " " + scale[i] : "") + (out ? " " + out : "");
      n = Math.floor(n / 1000); i++;
    }
    return (neg ? "Negative " : "") + out.trim();
  }

  function num(v, cur) {
    return `${symbolFor(cur)}${formatNumber(Number(v) || 0)}`;
  }

  /* ============================================================
     INVOICE
       • Header: logo + Email/Website (LEFT) • "INVOICE" (RIGHT).
         No "Invoice From" party block.
       • Invoice details (No./Date/Due) appear next to Bill To.
       • Bank details rendered as pure-typography section.
     ============================================================ */
  function renderInvoice(r) {
    const cur = r.currency || "BDT";
    const validItems = (r.items || []).filter(it => !isBlank(it.description) || Number(it.amount) > 0);
    const items = validItems.map(it => `
      <tr>
        <td class="left">${esc(it.description || "")}</td>
        <td class="num">${formatNumber(Number(it.quantity) || 0, 0, 2)}</td>
        <td class="num">${num(it.rate, cur)}</td>
        <td class="num">${num(it.amount, cur)}</td>
      </tr>`).join("");

    const clientHTML = [
      line(r.clientName,    { strong: true, name: true }),
      line(r.clientCompany),
      line(r.clientAddress),
      line(r.clientCity),
      line(r.clientEmail,   { label: "Email" }),
      line(r.clientPhone,   { label: "Phone" }),
    ].join("");

    // Invoice detail panel (No./Date/Due/Status) beside Bill To
    const detailRows = [];
    if (!isBlank(r.number))      detailRows.push(`<div class="inv-row"><span class="k">Invoice No.</span><span class="v">${esc(r.number)}</span></div>`);
    if (!isBlank(r.invoiceDate)) detailRows.push(`<div class="inv-row"><span class="k">Date</span><span class="v">${esc(formatDate(r.invoiceDate))}</span></div>`);
    if (!isBlank(r.dueDate))     detailRows.push(`<div class="inv-row"><span class="k">Due Date</span><span class="v">${esc(formatDate(r.dueDate))}</span></div>`);
    if (!isBlank(r.status))      detailRows.push(`<div class="inv-row status"><span class="k">Status</span><span class="v">${statusPill(r.status)}</span></div>`);
    const detailHTML = detailRows.length ? `<div class="inv-panel">${detailRows.join("")}</div>` : "";

    const partyGrid = (clientHTML || detailHTML) ? `
      <div class="party-grid">
        <div class="party">${clientHTML ? `<h3>Bill To</h3>${clientHTML}` : ""}</div>
        <div class="party">${detailHTML ? `<h3>Invoice Details</h3>${detailHTML}` : ""}</div>
      </div>` : "";

    const itemsSection = items ? `
      <table class="items">
        <thead><tr><th class="left">Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody>${items}</tbody>
      </table>` : "";

    const totalsRows = [];
    totalsRows.push(`<tr><td class="label">Subtotal</td><td>${num(r.subtotal, cur)}</td></tr>`);
    if (Number(r.discount) > 0)  totalsRows.push(`<tr><td class="label">Discount</td><td>- ${num(r.discount, cur)}</td></tr>`);
    if (Number(r.taxAmount) > 0) totalsRows.push(`<tr><td class="label">Tax${Number(r.taxRate)>0 ? ` (${formatNumber(r.taxRate,0,2)}%)` : ""}</td><td>${num(r.taxAmount, cur)}</td></tr>`);
    if (Number(r.shipping) > 0)  totalsRows.push(`<tr><td class="label">Fees / Charges</td><td>${num(r.shipping, cur)}</td></tr>`);
    totalsRows.push(`<tr class="grand"><td>Total Amount</td><td>${num(r.total, cur)}</td></tr>`);

    const total = Number(r.total) || 0;
    const inWords = total > 0 ? `<div class="amount-in-words"><strong>In Words:</strong> ${esc(numToWords(total))} ${esc(cur)} only.</div>` : "";

    // ---- Payment / bank information (typography-only) ----
    // Backwards-compat: legacy single-bank docs get auto-wrapped into an array.
    let banks = Array.isArray(r.banks) ? r.banks : [];
    if (!banks.length) {
      const legacy = { bankName: r.bankName, accountName: r.accountName, accountNumber: r.accountNumber, branchName: r.branchName, routingNumber: r.routingNumber };
      if (Object.values(legacy).some(v => !isBlank(v))) banks = [legacy];
    }
    banks = banks.filter(b => b && [b.bankName, b.accountName, b.accountNumber, b.branchName, b.routingNumber].some(v => !isBlank(v)));

    const bankBlockHTML = (b, idx) => `
      <div class="bank-body${banks.length > 1 ? " bank-multi" : ""}">
        ${banks.length > 1 ? `<div class="bank-idx">Bank ${idx + 1}</div>` : ""}
        ${!isBlank(b.bankName)      ? `<div class="bank-field name"><div class="bk">Bank Name</div><div class="bv">${esc(b.bankName)}</div></div>` : ""}
        ${!isBlank(b.accountName)   ? `<div class="bank-field name"><div class="bk">Account Name</div><div class="bv">${esc(b.accountName)}</div></div>` : ""}
        ${!isBlank(b.branchName)    ? `<div class="bank-field name"><div class="bk">Branch</div><div class="bv">${esc(b.branchName)}</div></div>` : ""}
        ${!isBlank(b.accountNumber) ? `<div class="bank-field"><div class="bk">Account Number</div><div class="bv">${esc(b.accountNumber)}</div></div>` : ""}
        ${!isBlank(b.routingNumber) ? `<div class="bank-field"><div class="bk">Routing / IFSC</div><div class="bv">${esc(b.routingNumber)}</div></div>` : ""}
      </div>`;

    const bankHTML = banks.length ? `
      <div class="bank-card">
        <div class="bank-head"><span><span class="ico">🏦</span>Payment Information — Bank Details</span><span class="cur">${esc(cur)}</span></div>
        ${banks.map(bankBlockHTML).join("")}
        <div class="bank-note">Please quote invoice number <strong>${esc(r.number || "")}</strong> on all bank transactions. Kindly send us a copy of the deposit slip for reconciliation.</div>
      </div>` : "";

    const body = `
      ${header("INVOICE", { address: r.headerAddress, phone: r.headerPhone, email: r.headerEmail, website: r.headerWebsite })}
      ${partyGrid}
      ${itemsSection}
      <div class="totals"><table>${totalsRows.join("")}</table></div>
      ${inWords}
      ${bankHTML}
      ${!isBlank(r.notes) ? `<div class="notes"><strong>Notes:</strong> ${esc(r.notes).replace(/\n/g,"<br>")}</div>` : ""}
    `;
    return {
      body: `<style>${COMMON_CSS}</style><div class="sheet"><div class="doc-body">${body}</div>${footer()}</div>`,
      filename: `${r.number || "invoice"}.pdf`
    };
  }

  /* ============================================================
     VOUCHER (Elegant redesign with hero band + hotel cards)
     ============================================================ */
  function starRating(n) {
    const v = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
    if (!v) return "";
    return "★".repeat(v) + "<span style='color:#ddd;'>" + "★".repeat(5 - v) + "</span>";
  }

  function renderVoucher(r) {
    const nights = Number(r.nights) || 0;
    const totalPax = (Number(r.adults) || 0) + (Number(r.children) || 0) + (Number(r.infants) || 0);
    const totalRooms = Number(r.rooms) || 0;

    const validHotels = (r.hotels || []).filter(h => h && !isBlank(h.name));

    // Hero band — no bg, standout via typography, "Booking for {Guest}"
    const arrivalDate = formatDate(r.arrival);
    const departureDate = formatDate(r.departure);
    const checkInHint  = !isBlank(r.checkInHint)  ? r.checkInHint  : "From 15:00";
    const checkOutHint = !isBlank(r.checkOutHint) ? r.checkOutHint : "By 12:00";
    const heroHTML = `
      <div class="voucher-hero">
        <div class="vh-band">
          <div>
            <div class="vh-title">Booking for</div>
            <div class="vh-guest">${esc(r.guestName || "Guest")}</div>
          </div>
          <div class="vh-right">
            ${!isBlank(r.bookingStatus) ? `<div>${statusPill(r.bookingStatus)}</div>` : ""}
            ${!isBlank(r.service) ? `<div class="vh-service">${esc(r.service)}</div>` : ""}
          </div>
        </div>
        <div class="vh-timeline">
          <div class="vh-side">
            <div class="vh-lbl">Check-in</div>
            <div class="vh-date">${esc(arrivalDate || "—")}</div>
            <div class="vh-sub">${esc(checkInHint)}</div>
          </div>
          <div class="vh-mid">
            <div class="vh-duration">
              <span class="n">${esc(nights ? (nights + "N") : "—")}</span>
              <span class="lbl">Duration</span>
            </div>
            <div class="vh-arrow">→</div>
          </div>
          <div class="vh-side right">
            <div class="vh-lbl">Check-out</div>
            <div class="vh-date">${esc(departureDate || "—")}</div>
            <div class="vh-sub">${esc(checkOutHint)}</div>
          </div>
        </div>
        <div class="vh-stats">
          <div class="vh-stat"><div class="vh-stat-v">${totalPax || 0}</div><div class="vh-stat-k">Guest${totalPax === 1 ? "" : "s"}</div></div>
          <div class="vh-stat"><div class="vh-stat-v">${totalRooms || 0}</div><div class="vh-stat-k">Room${totalRooms === 1 ? "" : "s"}</div></div>
          <div class="vh-stat"><div class="vh-stat-v">${validHotels.length}</div><div class="vh-stat-k">Hotel${validHotels.length === 1 ? "" : "s"}</div></div>
          <div class="vh-stat"><div class="vh-stat-v">${esc(!isBlank(r.mealPlan) ? String(r.mealPlan).split(/[^A-Za-z]/)[0].slice(0,4) : "—")}</div><div class="vh-stat-k">Meal Plan</div></div>
        </div>
      </div>`;

    // Hotel cards — MOST PROMINENT SECTION (immediately after hero)
    const hotelsHTML = validHotels.length ? `
      <h3 class="section">🏨 Hotel${validHotels.length > 1 ? "s" : ""} &amp; Accommodation</h3>
      <div class="hotels-block">
        ${validHotels.map(h => {
          const loc = [h.city, h.country].filter(x => !isBlank(x)).join(", ");
          const stars = starRating(h.stars || h.rating);
          const fields = [];
          if (!isBlank(h.address))      fields.push(`<div class="hc-field"><div class="hk">Address</div><div class="hv">${esc(h.address)}</div></div>`);
          if (!isBlank(h.confirmation)) fields.push(`<div class="hc-field"><div class="hk">Confirmation #</div><div class="hv mono">${esc(h.confirmation)}</div></div>`);
          if (!isBlank(h.rooms))        fields.push(`<div class="hc-field"><div class="hk">Rooms</div><div class="hv">${esc(h.rooms)}</div></div>`);
          if (!isBlank(h.roomType))     fields.push(`<div class="hc-field"><div class="hk">Room Type</div><div class="hv">${esc(h.roomType)}</div></div>`);
          if (!isBlank(h.mealPlan))     fields.push(`<div class="hc-field"><div class="hk">Meal Plan</div><div class="hv">${esc(h.mealPlan)}</div></div>`);
          if (!isBlank(h.checkIn))      fields.push(`<div class="hc-field"><div class="hk">Check-in</div><div class="hv">${esc(formatDate(h.checkIn))}</div></div>`);
          if (!isBlank(h.checkOut))     fields.push(`<div class="hc-field"><div class="hk">Check-out</div><div class="hv">${esc(formatDate(h.checkOut))}</div></div>`);
          if (!isBlank(h.phone))        fields.push(`<div class="hc-field"><div class="hk">Phone</div><div class="hv">${esc(h.phone)}</div></div>`);
          return `
            <div class="hotel-card">
              <div class="hc-head">
                <div class="hc-icon">🏨</div>
                <div class="hc-title">
                  <div class="hc-name">${esc(h.name)}</div>
                  ${loc ? `<div class="hc-loc">${esc(loc)}</div>` : ""}
                </div>
                ${stars ? `<div class="hc-stars">${stars}</div>` : ""}
              </div>
              ${fields.length ? `<div class="hc-body">${fields.join("")}</div>` : ""}
            </div>`;
        }).join("")}
      </div>` : "";

    // Guest block — elegant border-only
    // Additional-guest list logic: if there are any secondary guests, show numbered list;
    // otherwise show a single "Guest" row.
    const addGuests = Array.isArray(r.additionalGuests)
      ? r.additionalGuests.map(g => (typeof g === "string" ? g : (g && g.name))).filter(x => !isBlank(x))
      : [];
    const hasMany = addGuests.length > 0;
    const guestHeading = hasMany ? "Guests" : "Guest";
    const guestList = hasMany
      ? `<div class="gb-list">
           <div class="gb-item"><span class="gi-tag">Lead</span><span class="gi-name">${esc(r.guestName || "—")}</span></div>
           ${addGuests.map((g, i) => `<div class="gb-item"><span class="gi-tag">Guest ${i + 2}</span><span class="gi-name">${esc(g)}</span></div>`).join("")}
         </div>`
      : `<div class="gb-list"><div class="gb-item"><span class="gi-tag">Lead Guest</span><span class="gi-name">${esc(r.guestName || "—")}</span></div></div>`;

    const metaBits = [];
    if (!isBlank(r.guestPhone))    metaBits.push(`<span><span class="m-k">Phone:</span>${esc(r.guestPhone)}</span>`);
    if (!isBlank(r.guestEmail))    metaBits.push(`<span><span class="m-k">Email:</span>${esc(r.guestEmail)}</span>`);
    if (Number(r.adults) > 0)      metaBits.push(`<span><span class="m-k">Adults:</span>${r.adults}</span>`);
    if (Number(r.children) > 0)    metaBits.push(`<span><span class="m-k">Children:</span>${r.children}</span>`);
    if (Number(r.infants) > 0)     metaBits.push(`<span><span class="m-k">Infants:</span>${r.infants}</span>`);
    if (!isBlank(r.roomCategory))  metaBits.push(`<span><span class="m-k">Room Category:</span>${esc(r.roomCategory)}</span>`);
    if (!isBlank(r.mealPlan))      metaBits.push(`<span><span class="m-k">Meal Plan:</span>${esc(r.mealPlan)}</span>`);

    const guestSection = `
      <div class="guest-block">
        <div class="gb-head">${esc(guestHeading)}</div>
        ${guestList}
        ${metaBits.length ? `<div class="gb-meta">${metaBits.join("")}</div>` : ""}
      </div>`;

    // Booking No. + Booking Date are shown directly below the BOOKING VOUCHER
    // title on the top right of the header — no separate section anymore.
    const docMeta = [];
    if (!isBlank(r.number))                 docMeta.push({ label: "Booking No.",  value: r.number });
    const bookingDate = r.bookingDate || r.createdAt;
    if (!isBlank(bookingDate))              docMeta.push({ label: "Booking Date", value: formatDate(bookingDate) });

    const body = `
      ${header("BOOKING VOUCHER", {
        address: r.headerAddress, phone: r.headerPhone,
        email: r.headerEmail, website: r.headerWebsite,
        docMeta
      })}
      ${heroHTML}
      ${hotelsHTML}
      ${guestSection}
      ${!isBlank(r.note)  ? `<div class="notes"><strong>Special Note:</strong> ${esc(r.note).replace(/\n/g,"<br>")}</div>` : ""}
      ${!isBlank(r.terms) ? `<div class="terms"><strong>Terms &amp; Conditions</strong>\n${esc(r.terms)}</div>` : ""}
    `;
    return {
      body: `<style>${COMMON_CSS}</style><div class="sheet compact-h"><div class="doc-body">${body}</div>${footer()}</div>`,
      filename: `${r.number || "voucher"}.pdf`
    };
  }

  /* ============================================================
     AIRLINE TICKET
     ============================================================ */
  function renderTicket(r) {
    const airline = r.airline || {};
    const dep = r.departure || {};
    const arr = r.arrival || {};
    const logo = (global.Aviation && airline.iata) ? global.Aviation.airlineLogo(airline.iata) : "";

    const validPax = (r.passengers || []).filter(p => !isBlank(p && p.name));
    const passengers = validPax.map(p => {
      const bits = [];
      if (!isBlank(p.passport))    bits.push(line(p.passport,    { label: "Passport" }));
      if (!isBlank(p.nationality)) bits.push(line(p.nationality, { label: "Nationality" }));
      if (!isBlank(p.dob))         bits.push(line(formatDate(p.dob), { label: "DOB" }));
      if (!isBlank(p.seat))        bits.push(line(p.seat,        { label: "Seat", strong: true }));
      const typeLabel = !isBlank(p.type) ? ` <small style="color:#666;font-weight:500;">(${esc(p.type)})</small>` : "";
      return `
        <div class="party">
          <h3>Passenger</h3>
          <p class="name"><strong>${esc(p.name)}</strong>${typeLabel}</p>
          ${bits.join("")}
        </div>`;
    }).join("");

    const flightCode = `${airline.iata || ""}${r.flightNumber || ""}`.trim();

    const depTerminal = !isBlank(r.departTerminal) ? `Terminal ${esc(r.departTerminal)}` : "";
    const depGate     = !isBlank(r.departGate) ? `Gate ${esc(r.departGate)}` : "";
    const arrTerminal = !isBlank(r.arriveTerminal) ? `Terminal ${esc(r.arriveTerminal)}` : "";
    const depMeta = [depTerminal, depGate].filter(Boolean).join(" · ");
    const arrMeta = arrTerminal;

    const cityCountry = (obj) => [obj.city, obj.country].filter(x => !isBlank(x)).join(", ");

    const metaCells = [
      kv("Class", r.class),
      kv("Cabin", r.cabin),
      kv("Fare Basis", r.fareBasis),
      kv("Baggage", r.baggage),
      kv("Meal", r.meal),
      kv("Booking Ref", r.bookingRef),
    ].filter(Boolean).join("");

    const qrPayload = JSON.stringify({
      pnr: r.pnr || "", tkt: r.ticketNumber || "", flt: flightCode,
      name: (r.passengers || [])[0]?.name || ""
    });
    const barcodeVal = r.ticketNumber || r.pnr || "";

    const subline = [
      !isBlank(r.pnr)          ? `PNR ${r.pnr}`               : "",
      !isBlank(r.ticketNumber) ? `Ticket #${r.ticketNumber}`  : "",
    ].filter(Boolean).join(" • ");

    const body = `
      ${header("AIRLINE TICKET", { address: r.headerAddress, phone: r.headerPhone, email: r.headerEmail, website: r.headerWebsite, subline })}

      <div class="ticket-stub">
        <div class="ticket-band">
          <div class="airline">
            ${logo ? `<img src="${esc(logo)}" alt="${esc(airline.name || "")}" onerror="this.style.display='none'"/>` : ""}
            <span>${esc(airline.name || "Airline")}</span>
          </div>
          ${flightCode ? `<div class="flight-code">${esc(flightCode)}</div>` : ""}
        </div>
        <div class="ticket-body">
          <div class="side">
            <div class="code">${esc(dep.iata || "———")}</div>
            ${cityCountry(dep) ? `<div class="city">${esc(cityCountry(dep))}</div>` : ""}
            ${!isBlank(dep.name) ? `<div class="airport">${esc(dep.name)}</div>` : ""}
            ${!isBlank(r.departDate) || !isBlank(r.departTime) ? `
              <div class="datetime">
                ${[formatDate(r.departDate), A.formatTime(r.departTime)].filter(Boolean).join(" · ")}
                ${depMeta ? `<small>${depMeta}</small>` : ""}
              </div>` : ""}
          </div>
          <div class="divider"></div>
          <div class="side right">
            <div class="code">${esc(arr.iata || "———")}</div>
            ${cityCountry(arr) ? `<div class="city">${esc(cityCountry(arr))}</div>` : ""}
            ${!isBlank(arr.name) ? `<div class="airport">${esc(arr.name)}</div>` : ""}
            ${!isBlank(r.arriveDate) || !isBlank(r.arriveTime) ? `
              <div class="datetime">
                ${[formatDate(r.arriveDate), A.formatTime(r.arriveTime)].filter(Boolean).join(" · ")}
                ${arrMeta ? `<small>${arrMeta}</small>` : ""}
              </div>` : ""}
          </div>
        </div>
        ${metaCells ? `<div class="ticket-meta">${metaCells.replace(/class="kv"/g, 'class="cell"')}</div>` : ""}
        ${barcodeVal ? `
        <div class="ticket-codes">
          <div class="barcode" data-barcode="${esc(barcodeVal)}"></div>
          <div class="qr" data-qr="${esc(qrPayload)}"></div>
        </div>` : ""}
      </div>

      ${passengers ? `<div class="party-grid">${passengers}</div>` : ""}

      ${!isBlank(r.notes) ? `<div class="notes"><strong>Notes:</strong> ${esc(r.notes).replace(/\n/g,"<br>")}</div>` : ""}

      ${!isBlank(r.terms)
        ? `<div class="terms"><strong>Fare Rules &amp; Conditions</strong>\n${esc(r.terms)}</div>`
        : `<div class="terms"><strong>Important</strong>\n• Please arrive at the airport at least 3 hours before departure for international flights.\n• Carry a valid passport with at least 6 months validity.\n• Baggage allowance and fare rules vary by airline & class — check with the airline for details.</div>`}
    `;
    return {
      body: `<style>${COMMON_CSS}</style><div class="sheet"><div class="doc-body">${body}</div>${footer()}</div>`,
      filename: `${r.number || r.ticketNumber || "ticket"}.pdf`
    };
  }

  /* ============================================================
     AIRLINE TICKET INVOICE
     ============================================================ */
  function renderTicketInvoice(r) {
    const cur = r.currency || "BDT";
    const airline = r.airline || {};
    const dep = r.departure || {};
    const arr = r.arrival || {};

    const validPax = (r.passengers || []).filter(p => !isBlank(p && p.name));
    const paxRows = validPax.map(p =>
      `<tr>
        <td class="left">${esc(p.name)}</td>
        <td class="left">${esc(p.type || "ADT")}</td>
        <td class="left">${esc(p.ticketNumber || r.ticketNumber || "")}</td>
      </tr>`
    ).join("");

    const total = Number(r.total) || 0;
    const paid  = Number(r.paid)  || 0;
    const due   = Math.max(0, total - paid);

    const clientHTML = [
      line(r.clientName,    { strong: true, name: true }),
      line(r.clientCompany),
      line(r.clientEmail,   { label: "Email" }),
      line(r.clientPhone,   { label: "Phone" }),
    ].join("");

    const flightBits = [
      !isBlank(airline.name) ? `<p class="name"><strong>${esc(airline.name)}</strong>${airline.iata ? ` (${esc(airline.iata)})` : ""}</p>` : "",
      line(r.pnr,           { label: "PNR", strong: true }),
      line(r.ticketNumber,  { label: "Ticket #", strong: true }),
      line(r.bookingRef,    { label: "Booking Ref" }),
    ].join("");

    const flightCode = `${airline.iata || ""}${r.flightNumber || ""}`.trim();
    const cityCountry = (obj) => [obj.iata, obj.city].filter(x => !isBlank(x)).join(" · ");
    const flightKV = [
      kv("Flight", flightCode),
      kv("From", cityCountry(dep)),
      kv("To",   cityCountry(arr)),
      !isBlank(r.departDate) || !isBlank(r.departTime) ? kv("Depart", [formatDate(r.departDate), A.formatTime(r.departTime)].filter(Boolean).join(" · ")) : "",
      !isBlank(r.arriveDate) || !isBlank(r.arriveTime) ? kv("Arrive", [formatDate(r.arriveDate), A.formatTime(r.arriveTime)].filter(Boolean).join(" · ")) : "",
      kv("Class", r.class),
      kv("Cabin", r.cabin),
      kv("Baggage", r.baggage),
    ].filter(Boolean).join("");

    // Detail panel (right of Bill To)
    const detailRows = [];
    if (!isBlank(r.number))      detailRows.push(`<div class="inv-row"><span class="k">Invoice No.</span><span class="v">${esc(r.number)}</span></div>`);
    if (!isBlank(r.invoiceDate)) detailRows.push(`<div class="inv-row"><span class="k">Date</span><span class="v">${esc(formatDate(r.invoiceDate))}</span></div>`);
    if (!isBlank(r.status))      detailRows.push(`<div class="inv-row status"><span class="k">Status</span><span class="v">${statusPill(r.status)}</span></div>`);
    const detailHTML = detailRows.length ? `<div class="inv-panel">${detailRows.join("")}</div>` : "";

    const totalsRows = [
      `<tr><td class="label">Base Fare</td><td>${num(r.baseFare, cur)}</td></tr>`,
      Number(r.taxes) > 0         ? `<tr><td class="label">Taxes</td><td>${num(r.taxes, cur)}</td></tr>` : "",
      Number(r.vat) > 0           ? `<tr><td class="label">VAT${Number(r.vatRate)>0 ? ` (${formatNumber(r.vatRate,0,2)}%)` : ""}</td><td>${num(r.vat, cur)}</td></tr>` : "",
      Number(r.serviceCharge) > 0 ? `<tr><td class="label">Service Charge</td><td>${num(r.serviceCharge, cur)}</td></tr>` : "",
      Number(r.discount) > 0      ? `<tr><td class="label">Discount</td><td>- ${num(r.discount, cur)}</td></tr>` : "",
      `<tr class="grand"><td>Total Amount</td><td>${num(total, cur)}</td></tr>`,
      paid > 0 ? `<tr><td class="label">Paid</td><td>${num(paid, cur)}</td></tr>` : "",
      `<tr><td class="label" style="color:${due > 0 ? "#c62828" : "#0f9d58"};"><strong>${due > 0 ? "Balance Due" : "Fully Paid"}</strong></td><td style="color:${due > 0 ? "#c62828" : "#0f9d58"};font-weight:700">${num(due, cur)}</td></tr>`
    ].filter(Boolean).join("");

    // Bank block for ticket invoice
    const bankFields = [r.bankName, r.accountName, r.accountNumber, r.branchName, r.routingNumber];
    const hasBank = bankFields.some(f => !isBlank(f));
    const bankHTML = hasBank ? `
      <div class="bank-card">
        <div class="bank-head"><span><span class="ico">🏦</span>Payment Information — Bank Details</span><span class="cur">${esc(cur)}</span></div>
        <div class="bank-body">
          ${!isBlank(r.bankName)      ? `<div class="bank-field name"><div class="bk">Bank Name</div><div class="bv">${esc(r.bankName)}</div></div>` : ""}
          ${!isBlank(r.accountName)   ? `<div class="bank-field name"><div class="bk">Account Name</div><div class="bv">${esc(r.accountName)}</div></div>` : ""}
          ${!isBlank(r.branchName)    ? `<div class="bank-field name"><div class="bk">Branch</div><div class="bv">${esc(r.branchName)}</div></div>` : ""}
          ${!isBlank(r.accountNumber) ? `<div class="bank-field"><div class="bk">Account Number</div><div class="bv">${esc(r.accountNumber)}</div></div>` : ""}
          ${!isBlank(r.routingNumber) ? `<div class="bank-field"><div class="bk">Routing / IFSC</div><div class="bv">${esc(r.routingNumber)}</div></div>` : ""}
        </div>
        <div class="bank-note">Please quote invoice number <strong>${esc(r.number || "")}</strong> on all bank transactions.</div>
      </div>` : "";

    const body = `
      ${header("AIRLINE TICKET INVOICE", { address: r.headerAddress, phone: r.headerPhone, email: r.headerEmail, website: r.headerWebsite })}
      ${(clientHTML || detailHTML) ? `
      <div class="party-grid">
        <div class="party">${clientHTML ? `<h3>Bill To</h3>${clientHTML}` : ""}</div>
        <div class="party">${detailHTML ? `<h3>Invoice Details</h3>${detailHTML}` : ""}</div>
      </div>` : ""}
      ${flightBits ? `<h3 class="section">Airline &amp; Reference</h3><div class="party">${flightBits}</div>` : ""}

      ${flightKV ? `<h3 class="section">Flight Details</h3><div class="kv-grid cols-4">${flightKV}</div>` : ""}

      ${paxRows ? `
      <h3 class="section">Passengers</h3>
      <table class="items">
        <thead><tr><th class="left">Passenger Name</th><th class="left">Type</th><th class="left">Ticket #</th></tr></thead>
        <tbody>${paxRows}</tbody>
      </table>` : ""}

      <h3 class="section">Fare Breakdown</h3>
      <div class="totals stretch"><table>${totalsRows}</table></div>
      ${total > 0 ? `<div class="amount-in-words"><strong>In Words:</strong> ${esc(numToWords(total))} ${esc(cur)} only.</div>` : ""}
      ${row("Payment Method", r.paymentMethod)}
      ${bankHTML}
      ${!isBlank(r.notes) ? `<div class="notes"><strong>Notes:</strong> ${esc(r.notes).replace(/\n/g,"<br>")}</div>` : ""}
      <div class="terms"><strong>Terms &amp; Conditions</strong>
${esc(r.terms || "• Tickets are non-refundable unless otherwise specified in the fare rules.\n• Name change is not permitted. Please verify passenger names before payment.\n• Airline schedule changes are the responsibility of the operating carrier.\n• All fees & taxes are subject to change per airline / regulator.")}
      </div>
    `;
    return {
      body: `<style>${COMMON_CSS}</style><div class="sheet"><div class="doc-body">${body}</div>${footer()}</div>`,
      filename: `${r.number || "ticket-invoice"}.pdf`
    };
  }

  /* ---------- Router ---------- */
  function renderByType(doc) {
    if (!doc || !doc.type) {
      return { body: `<div class="sheet"><div class="doc-body">No document to preview.</div></div>`, filename: "document.pdf" };
    }
    switch (doc.type) {
      case "invoice":       return renderInvoice(doc);
      case "voucher":       return renderVoucher(doc);
      case "ticket":        return renderTicket(doc);
      case "ticketInvoice": return renderTicketInvoice(doc);
      default:              return { body: `<div class="sheet"><div class="doc-body">Unsupported document type: ${esc(doc.type)}</div></div>`, filename: "document.pdf" };
    }
  }

  /* ---------- Barcode/QR post-processor ---------- */
  function decorateTicket(rootNode) {
    if (!rootNode) return;
    if (window.JsBarcode) {
      rootNode.querySelectorAll("[data-barcode]").forEach(el => {
        const val = el.getAttribute("data-barcode"); if (!val) return;
        if (el.dataset.barcodeDone === "1") return;
        el.innerHTML = "";
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        el.appendChild(svg);
        try {
          window.JsBarcode(svg, val, { format: "CODE128", displayValue: true, fontSize: 12, margin: 0, height: 46, background: "#ffffff", lineColor: "#000000" });
          el.dataset.barcodeDone = "1";
        } catch (e) { console.warn("Barcode failed:", e); }
      });
    }
    if (window.QRCode) {
      rootNode.querySelectorAll("[data-qr]").forEach(el => {
        const val = el.getAttribute("data-qr"); if (!val) return;
        if (el.dataset.qrDone === "1") return;
        el.innerHTML = "";
        try {
          new window.QRCode(el, { text: val, width: 72, height: 72, correctLevel: window.QRCode.CorrectLevel.M });
          el.dataset.qrDone = "1";
        } catch (e) { console.warn("QR failed:", e); }
      });
    }
  }

  global.DocRenderers = {
    renderByType, renderInvoice, renderVoucher, renderTicket, renderTicketInvoice,
    decorateTicket, numToWords, COMMON_CSS
  };
})(window);
