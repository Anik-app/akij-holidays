/* =========================================================
   Akij Holidays — Smart Ticket Importer
   ---------------------------------------------------------
   Parse an airline e-ticket / itinerary from:
     • Plain text (paste)
     • PDF file (pdf.js loaded on demand)
     • .txt file
     • Image file (Tesseract.js OCR loaded on demand)

   Detects airline, flight number, PNR, ticket number,
   departure & arrival airports (IATA), dates/times,
   class/cabin, baggage, and passenger names.
   Uses the app's Aviation dataset as the ground truth.
   ========================================================= */
(function (global) {
  "use strict";

  const AV = global.Aviation;

  const RX = {
    pnr: [
      /\bPNR\s*[:#]?\s*([A-Z0-9]{5,7})\b/i,
      /\bBooking\s*Reference\s*[:#]?\s*([A-Z0-9]{5,7})\b/i,
      /\bReservation\s*Code\s*[:#]?\s*([A-Z0-9]{5,7})\b/i,
      /\b(?:record\s*locator|locator)\s*[:#]?\s*([A-Z0-9]{5,7})\b/i,
      /\bconfirmation\s*(?:code|number|#)\s*[:#]?\s*([A-Z0-9]{5,7})\b/i
    ],
    ticketNumber: [
      /\bTicket\s*(?:Number|No\.?|#)\s*[:#]?\s*(\d{3}\s*-?\s*\d{7,10})/i,
      /\be[- ]?Ticket\s*(?:Number|No\.?|#)?\s*[:#]?\s*(\d{3}\s*-?\s*\d{7,10})/i,
      /\b(\d{3}-\d{10})\b/
    ],
    cabin: /\b(economy|premium\s+economy|business|first)\s*(?:class)?\b/i,
    time: /\b(\d{1,2}):(\d{2})(?::\d{2})?\s?(am|pm)?\b/i
  };

  const MONTHS_M = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };

  const twoDigit = (n) => String(n).padStart(2, "0");
  const toIsoDate = (y, m, d) => `${y}-${twoDigit(m + 1)}-${twoDigit(d)}`;
  const toIsoTime = (h, min, ampm) => {
    let hh = Number(h) || 0;
    if (ampm) {
      const p = ampm.toLowerCase();
      if (p === "pm" && hh < 12) hh += 12;
      if (p === "am" && hh === 12) hh = 0;
    }
    return `${twoDigit(hh)}:${twoDigit(min)}`;
  };

  /* Detect airline from full text — priority: name > IATA prefix > ICAO */
  function detectAirline(text) {
    if (!AV) return null;
    const upper = text.toUpperCase();
    // 1. Full airline name — longest first
    const byName = [...AV.AIRLINES].sort((a, b) => b.name.length - a.name.length);
    for (const a of byName) {
      // Word-boundary-ish check to avoid false partials on common words
      const n = a.name.toUpperCase();
      if (n.length >= 4 && upper.includes(n)) return a;
    }
    // 2. IATA airline code + flight-number pattern
    const m = upper.match(/\b([A-Z0-9]{2})\s?\d{1,4}\b/);
    if (m) {
      const cand = AV.findAirlineByIata(m[1]);
      if (cand) return cand;
    }
    // 3. ICAO 3-letter airline code
    const icaoMatches = upper.match(/\b([A-Z]{3})\b/g) || [];
    for (const code of icaoMatches) {
      const cand = AV.AIRLINES.find(a => a.icao === code);
      if (cand) return cand;
    }
    return null;
  }

  /* Detect airports.  Try "from ... (XXX)" / "to ... (YYY)" first, then
     fall back to first two unique IATA codes in the text. */
  function detectRoute(text) {
    if (!AV) return { departure: null, arrival: null };

    // Collect all IATA airport codes (skipping ICAO airline codes)
    const upper = text.toUpperCase();
    const codes = [];
    const rx = /\b([A-Z]{3})\b/g;
    let m;
    while ((m = rx.exec(upper))) {
      const cand = AV.findAirportByIata(m[1]);
      if (cand) codes.push({ code: m[1], airport: cand, index: m.index });
    }

    // Dedup (keep first occurrence)
    const seen = new Set();
    const unique = codes.filter(c => {
      if (seen.has(c.code)) return false;
      seen.add(c.code); return true;
    });

    if (!unique.length) return { departure: null, arrival: null };

    // Explicit "from ... XXX" / "to ... YYY" hints
    let dep = null, arr = null;
    const fromM = /(?:from|dep(?:arture|art)?)\b[^A-Z]{0,40}\b([A-Z]{3})\b/i.exec(text);
    const toM   = /(?:to|arr(?:ival|ive)?)\b[^A-Z]{0,40}\b([A-Z]{3})\b/i.exec(text);
    if (fromM) dep = AV.findAirportByIata(fromM[1]);
    if (toM)   arr = AV.findAirportByIata(toM[1]);
    if (dep && arr && dep.iata !== arr.iata) return { departure: dep, arrival: arr };

    // Fallback: first two unique IATA codes
    return {
      departure: unique[0].airport,
      arrival: unique.length >= 2 ? unique[1].airport : null
    };
  }

  /* Pull ISO dates from the text */
  function detectDates(text) {
    const dates = [];
    // Named-month: 15 Nov 2026 / 15-Nov-2026 / Nov 15, 2026
    const rx1 = /(\d{1,2})[-/\s](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\s,]?\s?(\d{2,4})/gi;
    const rx2 = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{2,4})/gi;
    let m;
    while ((m = rx1.exec(text))) {
      const day = Number(m[1]);
      const mon = MONTHS_M[m[2].toLowerCase().slice(0, 3)];
      let year = Number(m[3]); if (year < 100) year += 2000;
      if (isFinite(day) && mon != null && isFinite(year)) dates.push(toIsoDate(year, mon, day));
      if (dates.length >= 4) break;
    }
    if (dates.length < 2) {
      while ((m = rx2.exec(text))) {
        const mon = MONTHS_M[m[1].toLowerCase().slice(0, 3)];
        const day = Number(m[2]);
        let year = Number(m[3]); if (year < 100) year += 2000;
        if (isFinite(day) && mon != null && isFinite(year)) dates.push(toIsoDate(year, mon, day));
        if (dates.length >= 4) break;
      }
    }
    if (dates.length === 0) {
      const rxIso = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g;
      while ((m = rxIso.exec(text))) {
        dates.push(toIsoDate(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
        if (dates.length >= 4) break;
      }
    }
    return { departDate: dates[0] || "", arriveDate: dates[1] || dates[0] || "" };
  }

  function detectTimes(text) {
    const times = [];
    const rx = /\b(\d{1,2}):(\d{2})(?::\d{2})?\s?(am|pm)?\b/gi;
    let m;
    while ((m = rx.exec(text))) {
      times.push(toIsoTime(m[1], m[2], m[3]));
      if (times.length >= 4) break;
    }
    return { departTime: times[0] || "", arriveTime: times[1] || "" };
  }

  /* Detect passenger names.  Handles common ticket formats:
     • SURNAME/GIVENNAME MR
     • Passenger: FirstName LastName
     • Name: FIRSTNAME LASTNAME */
  function detectPassengers(text) {
    const found = new Set();
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // SURNAME/GIVENNAME [TITLE]
      let m = trimmed.match(/^([A-Z][A-Z\s'\-]{1,40})\s*\/\s*([A-Z][A-Z\s.'\-]{1,40}?)(?:\s+(MR|MRS|MS|MISS|MSTR|DR|PROF))?\s*$/);
      if (m) {
        const surname = m[1].replace(/\s+/g, " ").trim();
        const given   = m[2].replace(/\s+/g, " ").trim();
        const title   = m[3] || "";
        const full = `${given} ${surname}${title ? " " + title : ""}`.trim();
        if (full.length >= 3 && full.length <= 80) found.add(full);
        continue;
      }

      // "Name: ... " / "Passenger: ..." / "Traveler: ..."
      m = trimmed.match(/^(?:name|passenger|traveler|traveller|pax)\s*(?:\d+)?\s*[:#]\s*(.{3,80}?)$/i);
      if (m) {
        const cand = m[1].trim().replace(/\s+/g, " ");
        if (/^[A-Za-z][A-Za-z\s.'\-\/]{2,}$/.test(cand)) {
          // normalise SURNAME/GIVEN if present
          const slash = cand.match(/^([A-Za-z\s'\-]+)\s*\/\s*([A-Za-z\s.'\-]+?)(\s+(MR|MRS|MS|MISS|MSTR|DR|PROF))?$/i);
          if (slash) {
            const full = `${slash[2].trim()} ${slash[1].trim()}${slash[3] ? " " + slash[3].trim() : ""}`.toUpperCase();
            if (full.length >= 3) found.add(full);
          } else {
            found.add(cand.toUpperCase());
          }
        }
      }
    }
    return [...found].map(name => ({
      name,
      type: /INF|INFANT/i.test(name) ? "INF" : /CHD|CHILD/i.test(name) ? "CHD" : "ADT"
    }));
  }

  function detectClassCabin(text) {
    const m = text.match(RX.cabin);
    if (!m) return { class: "", cabin: "" };
    const s = m[1].toLowerCase();
    if (/business/.test(s))    return { class: "Business", cabin: "C — Business" };
    if (/first/.test(s))       return { class: "First",    cabin: "F — First" };
    if (/premium/.test(s))     return { class: "Premium Economy", cabin: "W — Premium Economy" };
    return { class: "Economy", cabin: "Y — Economy" };
  }

  function detectBaggage(text) {
    const m = text.match(/(\d{1,3})\s*(?:kg|kilogram|kilos)\b/i);
    return m ? `${m[1]} kg` : "";
  }

  function detectSingle(text, patterns) {
    for (const rx of patterns) {
      const m = text.match(rx);
      if (m) return m.slice(1).filter(Boolean).join("").replace(/\s+/g, "");
    }
    return "";
  }

  /* Main entry: parse plain text.
     Returns an object matching the ticket form fields. */
  function parseText(rawText) {
    const text = (rawText || "").replace(/\r/g, "");
    const airline = detectAirline(text);
    const { departure, arrival } = detectRoute(text);
    const { departDate, arriveDate } = detectDates(text);
    const { departTime, arriveTime } = detectTimes(text);
    const passengers = detectPassengers(text);
    const cc = detectClassCabin(text);
    const baggage = detectBaggage(text);
    const pnr = detectSingle(text, RX.pnr);
    const ticketNumber = detectSingle(text, RX.ticketNumber);

    // Flight number — prefer airline-prefixed match
    let flightNumber = "";
    if (airline) {
      const rx = new RegExp("\\b" + airline.iata + "\\s?(\\d{1,4}[A-Z]?)\\b");
      const mm = text.toUpperCase().match(rx);
      if (mm) flightNumber = mm[1];
    }
    if (!flightNumber) {
      const fnMatch = text.match(/\bFlight\s*(?:No\.?|Number|#)?\s*[:#]?\s*[A-Z0-9]{2,3}\s?(\d{1,4}[A-Z]?)/i);
      if (fnMatch) flightNumber = fnMatch[1];
    }

    return {
      airline: airline || null,
      flightNumber,
      pnr,
      ticketNumber,
      departure: departure || null,
      arrival: arrival || null,
      departDate, departTime,
      arriveDate, arriveTime,
      class: cc.class,
      cabin: cc.cabin,
      baggage,
      passengers,
      raw: text.slice(0, 4000)
    };
  }

  /* ---------- PDF extraction via pdf.js ---------- */
  const PDF_JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  const PDF_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  let pdfJsPromise = null;
  function loadPdfJs() {
    if (pdfJsPromise) return pdfJsPromise;
    pdfJsPromise = new Promise((resolve, reject) => {
      if (window.pdfjsLib) return resolve(window.pdfjsLib);
      const s = document.createElement("script");
      s.src = PDF_JS_URL;
      s.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER;
          resolve(window.pdfjsLib);
        } else reject(new Error("pdf.js failed to expose pdfjsLib"));
      };
      s.onerror = () => reject(new Error("pdf.js failed to load"));
      document.head.appendChild(s);
    });
    return pdfJsPromise;
  }
  async function extractTextFromPdf(file) {
    const pdfjs = await loadPdfJs();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Reconstruct with newlines whenever the y-coordinate changes significantly
      let lastY = null; let line = "";
      for (const item of content.items) {
        const y = item.transform ? item.transform[5] : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
          text += line.trim() + "\n"; line = "";
        }
        line += item.str + " ";
        lastY = y;
      }
      if (line.trim()) text += line.trim() + "\n";
      text += "\n";
    }
    return text;
  }

  /* ---------- OCR via Tesseract.js (loaded on demand for images) ---------- */
  const TESS_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
  let tesseractPromise = null;
  function loadTesseract() {
    if (tesseractPromise) return tesseractPromise;
    tesseractPromise = new Promise((resolve, reject) => {
      if (window.Tesseract) return resolve(window.Tesseract);
      const s = document.createElement("script");
      s.src = TESS_URL;
      s.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error("Tesseract failed to load"));
      s.onerror = () => reject(new Error("Tesseract failed to load"));
      document.head.appendChild(s);
    });
    return tesseractPromise;
  }
  async function extractTextFromImage(file, onProgress) {
    const T = await loadTesseract();
    const result = await T.recognize(file, "eng", {
      logger: m => { if (onProgress && m.status) onProgress(m); }
    });
    return result.data.text || "";
  }

  /* ---------- Public: parse a File (PDF / txt / image) ---------- */
  async function parseFile(file, onProgress) {
    if (!file) return null;
    const name = (file.name || "").toLowerCase();
    const type = (file.type || "").toLowerCase();
    onProgress?.({ status: "reading" });
    let text = "";
    if (type.startsWith("image/") || /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(name)) {
      onProgress?.({ status: "loading-ocr" });
      text = await extractTextFromImage(file, onProgress);
    } else if (type === "application/pdf" || /\.pdf$/i.test(name)) {
      onProgress?.({ status: "extracting-pdf" });
      text = await extractTextFromPdf(file);
    } else {
      text = await file.text();
    }
    onProgress?.({ status: "parsing" });
    const parsed = parseText(text);
    onProgress?.({ status: "done" });
    return parsed;
  }

  global.TicketImport = { parseText, parseFile, extractTextFromPdf, extractTextFromImage };
})(window);
