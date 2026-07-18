/* =========================================================
   Akij Holidays — Doc Actions (Production Build)
   Common save / print / PDF / copy / share wiring
   used by every maker.
   ========================================================= */
(function (global) {
  "use strict";

  const A = global.AkijApp;
  if (!A) return;
  const { Store, Toast, Print, PDF, GitHub, Sheets, Mailer, Clipboard, nowIso, debounce, safeLocalStorage, escapeHTML } = A;
  const { renderByType, decorateTicket } = global.DocRenderers;

  /**
   * @param {object} opts
   *   getDoc()         → returns the current record object (with type set)
   *   validate()       → returns null if OK, else an error string
   *   onSaved(doc)     → optional callback
   *   setStatus(str)   → optional status text setter
   *   btnSave, btnPrint, btnPDF, btnCopy — optional buttons to wire
   *   previewNode      — optional preview element to render into
   */
  function attach(opts) {
    const { getDoc, validate, onSaved, setStatus } = opts;
    let busy = false;

    async function doSave() {
      if (busy) return null;
      const err = validate ? validate() : null;
      if (err) { Toast.show(err, "error"); return null; }
      busy = true;
      try {
        const doc = getDoc();
        setStatus?.("Saving…", "working");

        // Local (always)
        let saved;
        try { saved = Store.save(doc); }
        catch (e) { setStatus?.("Local save failed", "error"); Toast.show("Local save failed: " + e.message, "error"); return null; }

        // Sheets (fire-and-forget)
        if (Sheets.isEnabled()) Sheets.log(doc.type, doc).catch(() => {});

        // GitHub
        if (GitHub.isEnabled()) {
          setStatus?.("Uploading to GitHub…", "working");
          try {
            const res = await GitHub.saveDoc(doc);
            if (res.ok) {
              doc.githubPath = res.path; doc.githubUrl = res.html_url;
              doc.githubSha  = res.sha;  doc.syncedAt = nowIso();
              Store.save(doc);
              setStatus?.("Saved · Cloud synced ✓", "ok");
              Toast.show("Saved & uploaded to GitHub", "success");
            } else {
              setStatus?.("Saved locally · GitHub sync failed", "error");
              Toast.show("GitHub sync failed: " + (res.error || "unknown"), "warn", 6000);
            }
          } catch (e) {
            setStatus?.("Saved locally · Network error", "error");
            Toast.show("GitHub upload error: " + e.message, "warn", 5000);
          }
        } else {
          setStatus?.("Saved locally", "ok");
          Toast.show("Saved locally", "success", 1800);
        }
        onSaved?.(doc);
        return doc;
      } finally {
        busy = false;
      }
    }

    async function doPrint() {
      const doc = await doSave();
      if (!doc) return;
      const { bodyHTML, filename } = await _renderedBodyFor(doc);
      Print.open(bodyHTML, filename.replace(/\.pdf$/i, ""));
    }

    async function doPDF() {
      const doc = await doSave();
      if (!doc) return;
      const { bodyHTML, filename } = await _renderedBodyFor(doc);
      Toast.show("Preparing PDF…", "info", 1400);
      await PDF.download(bodyHTML, filename);
    }

    /* Prepare the fully-decorated HTML body for a doc (ticket barcodes
       already materialised).  Reused by Print/PDF/Email. */
    async function _renderedBodyFor(doc) {
      const rendered = renderByType(doc);
      let bodyHTML = rendered.body;
      if (doc.type === "ticket") {
        const host = document.createElement("div");
        host.style.cssText = "position:fixed;left:-99999px;top:0;width:210mm;background:#fff;z-index:-1;";
        host.innerHTML = rendered.body;
        document.body.appendChild(host);
        try {
          decorateTicket(host);
          await new Promise(r => setTimeout(r, 300));
          bodyHTML = host.innerHTML;
        } finally { host.remove(); }
      }
      return { bodyHTML, filename: rendered.filename };
    }

    async function doEmail(target) {
      const doc = await doSave();
      if (!doc) return;
      if (!Mailer.isEnabled()) {
        Toast.show("Email service not configured. Open Settings → Google Sheets Logger to paste the Web App URL.", "warn", 6000);
        return;
      }
      const { bodyHTML, filename } = await _renderedBodyFor(doc);
      openEmailPopover(target || opts.btnEmail, doc, bodyHTML, filename);
    }

    async function doCopy() {
      const err = validate ? validate() : null;
      if (err) { Toast.show(err, "error"); return; }
      const doc = getDoc();
      // Build a plain-text summary of key fields
      const rendered = renderByType(doc);
      // Strip HTML tags for a plain-text copy
      const tmp = document.createElement("div");
      tmp.innerHTML = rendered.body;
      // Remove style blocks
      tmp.querySelectorAll("style").forEach(el => el.remove());
      const text = tmp.textContent.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      const ok = await Clipboard.writeText(text);
      Toast.show(ok ? "Copied document text to clipboard" : "Copy failed — try Print instead", ok ? "success" : "error");
    }

    opts.btnSave  && opts.btnSave.addEventListener("click", doSave);
    opts.btnPrint && opts.btnPrint.addEventListener("click", doPrint);
    opts.btnPDF   && opts.btnPDF.addEventListener("click", doPDF);
    opts.btnCopy  && opts.btnCopy.addEventListener("click", doCopy);
    opts.btnEmail && opts.btnEmail.addEventListener("click", (ev) => doEmail(ev.currentTarget));

    // Keyboard shortcuts: Ctrl/Cmd+S = save, Ctrl/Cmd+P = print
    document.addEventListener("keydown", (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === "s" || e.key === "S") { e.preventDefault(); doSave(); }
      else if (e.key === "p" || e.key === "P") { e.preventDefault(); doPrint(); }
    });

    return { save: doSave, print: doPrint, pdf: doPDF, copy: doCopy, email: doEmail };
  }

  /* ---------- Email popover ------------------------------------------
     Lightweight in-page popover anchored below the "Email PDF" button.
     Fields: To (email), CC (opt), Subject, Message.  On send we generate
     the PDF blob via PDF.blobFromHTML(), then hand it to Mailer.send().  */
  let _emailPopEl = null;
  function openEmailPopover(anchor, doc, bodyHTML, filename) {
    // Close any prior popover
    _emailPopEl && _emailPopEl.remove();

    const rememberedTo = safeLocalStorage.get("akij.email.lastTo") || "";
    const rememberedCC = safeLocalStorage.get("akij.email.lastCC") || "";

    const partyName = doc.clientName || doc.guestName || (doc.passengers && doc.passengers[0]?.name) || "";
    const number = doc.number || doc.id || "";
    const defaultSubject = `${(A.CFG.DOC_TYPES?.[doc.type]?.label) || "Document"}${number ? ` ${number}` : ""}${partyName ? " — " + partyName : ""}`;
    const defaultMessage = `Dear${partyName ? " " + partyName : " Sir/Madam"},\n\nPlease find attached your ${(A.CFG.DOC_TYPES?.[doc.type]?.label || "document").toLowerCase()}${number ? " (" + number + ")" : ""}.\n\nBest regards,\n${(A.CFG.COMPANY?.name || "Akij Holidays")}`;

    const el = document.createElement("div");
    el.className = "email-popover";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Email this PDF");
    el.innerHTML = `
      <style>
        .email-popover {
          position: fixed; z-index: 2147483646;
          background: var(--surface, #fff); color: var(--text, #222);
          border: 1px solid var(--border, #e5e7eb); border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, .18);
          padding: 16px; width: min(420px, calc(100vw - 24px));
          max-height: calc(100vh - 24px); overflow: auto;
          font-family: var(--font, 'Poppins', sans-serif); font-size: 13.5px;
          animation: ep-fade .16s ease-out;
        }
        @keyframes ep-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        .email-popover .ep-h { display: flex; align-items: center; gap: 8px; margin: -2px 0 10px; }
        .email-popover .ep-h strong { flex: 1; font-size: 14px; color: var(--primary, #8e011a); }
        .email-popover .ep-close { background: transparent; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted, #6b7280); }
        .email-popover label { display: block; font-size: 11.5px; font-weight: 600; color: var(--text-muted, #6b7280); text-transform: uppercase; letter-spacing: .04em; margin: 8px 0 4px; }
        .email-popover input, .email-popover textarea {
          width: 100%; padding: 9px 11px; border: 1px solid var(--border-strong, #d1d5db); border-radius: 8px;
          background: var(--surface, #fff); color: var(--text, #222); font-family: inherit; font-size: 13px;
          box-sizing: border-box;
        }
        .email-popover input:focus, .email-popover textarea:focus {
          outline: none; border-color: var(--primary, #8e011a); box-shadow: 0 0 0 3px rgba(142,1,26,.14);
        }
        .email-popover textarea { resize: vertical; min-height: 84px; }
        .email-popover .ep-actions { display: flex; gap: 8px; align-items: center; justify-content: flex-end; margin-top: 12px; }
        .email-popover .ep-actions .btn { min-width: 96px; }
        .email-popover .ep-hint { font-size: 11.5px; color: var(--text-muted, #6b7280); margin-top: 6px; }
        .email-popover .ep-status { font-size: 12px; margin-top: 6px; min-height: 16px; }
        .email-popover .ep-status.ok  { color: #0f9d58; }
        .email-popover .ep-status.err { color: #c62828; }
        @media (max-width: 640px) {
          .email-popover { left: 12px !important; right: 12px !important; top: 12px !important; width: auto; }
        }
      </style>
      <div class="ep-h">
        <span>✉️</span>
        <strong>Email this PDF</strong>
        <button type="button" class="ep-close" aria-label="Close">✕</button>
      </div>
      <label>To</label>
      <input type="email" id="epTo" placeholder="customer@example.com" value="${escapeHTML(rememberedTo)}" autocomplete="email" required>
      <label>Cc (optional)</label>
      <input type="text" id="epCc" placeholder="cc1@example.com, cc2@example.com" value="${escapeHTML(rememberedCC)}">
      <label>Subject</label>
      <input type="text" id="epSubject" value="${escapeHTML(defaultSubject)}">
      <label>Message</label>
      <textarea id="epMessage">${escapeHTML(defaultMessage)}</textarea>
      <div class="ep-hint">The PDF will be attached automatically as <strong>${escapeHTML(filename)}</strong>.</div>
      <div class="ep-status" id="epStatus"></div>
      <div class="ep-actions">
        <button type="button" class="btn btn-ghost btn-sm" id="epCancel">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" id="epSend">Send →</button>
      </div>`;
    document.body.appendChild(el);
    _emailPopEl = el;

    // Position: anchored below the button if possible, otherwise centered.
    function place() {
      const isMobile = window.innerWidth < 640;
      if (isMobile || !anchor) return;   // CSS handles the mobile case
      const r = anchor.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      let top  = r.bottom + 8;
      let left = Math.min(r.right - w, window.innerWidth - w - 12);
      if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
      if (left < 8) left = 8;
      el.style.top  = top + "px";
      el.style.left = left + "px";
    }
    place();
    window.addEventListener("resize", place);
    // Click-outside to close
    const onDoc = (e) => { if (!el.contains(e.target) && e.target !== anchor) { close(); } };
    setTimeout(() => document.addEventListener("mousedown", onDoc), 0);

    function close() {
      window.removeEventListener("resize", place);
      document.removeEventListener("mousedown", onDoc);
      el.remove(); _emailPopEl = null;
    }

    el.querySelector("#epClose, .ep-close").addEventListener("click", close);
    el.querySelector("#epCancel").addEventListener("click", close);
    el.querySelector("#epTo").focus();

    el.querySelector("#epSend").addEventListener("click", async () => {
      const to = el.querySelector("#epTo").value.trim();
      const cc = el.querySelector("#epCc").value.trim();
      const subject = el.querySelector("#epSubject").value.trim() || defaultSubject;
      const message = el.querySelector("#epMessage").value.trim() || defaultMessage;
      const status = el.querySelector("#epStatus");
      if (!/^\S+@\S+\.\S+$/.test(to)) { status.textContent = "Please enter a valid recipient email."; status.className = "ep-status err"; el.querySelector("#epTo").focus(); return; }

      const btn = el.querySelector("#epSend");
      btn.disabled = true; btn.textContent = "Generating PDF…";
      status.textContent = ""; status.className = "ep-status";

      let blob;
      try { blob = await PDF.blobFromHTML(bodyHTML, filename); }
      catch (e) { status.textContent = "PDF error: " + (e.message || "unknown"); status.className = "ep-status err"; btn.disabled = false; btn.textContent = "Send →"; return; }

      btn.textContent = "Sending…";
      const res = await Mailer.send({ to, cc, subject, message, filename, blob });
      if (res.ok) {
        safeLocalStorage.set("akij.email.lastTo", to);
        if (cc) safeLocalStorage.set("akij.email.lastCC", cc); else safeLocalStorage.remove("akij.email.lastCC");
        status.textContent = "✓ Sent to " + (res.sent || to);
        status.className = "ep-status ok";
        Toast.show("Email queued for " + (res.sent || to), "success", 3500);
        setTimeout(close, 1400);
      } else {
        status.textContent = "✗ " + (res.error || "send failed");
        status.className = "ep-status err";
        btn.disabled = false; btn.textContent = "Send →";
      }
    });
  }

  /* Live-preview helper — renders the current doc into the preview node.
     Debounced so rapid typing doesn't thrash rendering. */
  function renderPreview(previewNode, doc) {
    if (!previewNode) return;
    const rendered = renderByType(doc);
    previewNode.innerHTML = rendered.body;
    if (doc.type === "ticket") {
      // Give layout a tick, then decorate barcode/QR
      requestAnimationFrame(() => decorateTicket(previewNode));
    }
  }

  // Debounced factory — pages call this once per maker.
  function makeDebouncedPreview(previewNode, getDoc, wait = 120) {
    return debounce(() => {
      try { renderPreview(previewNode, getDoc()); }
      catch (e) { console.error("Preview render error:", e); }
    }, wait);
  }

  global.DocActions = { attach, renderPreview, makeDebouncedPreview };
})(window);
