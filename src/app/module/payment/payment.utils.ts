import PDFDocument from "pdfkit";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
export interface HotelBookingInvoiceData {
  // Booking & payment
  bookingId: string;
  transactionId: string;
  paymentDate: string;
  paymentMethod: string;

  // Guest
  guestName: string;
  guestEmail: string;

  // Property
  hotelName: string;
  hotelLocation: string;
  roomType: string; 

  // Stay
  checkIn: string;  
  checkOut: string;
  nights: number;
  guests: number;

  
  ratePerNight: number;
  taxes: number;      
  discount?: number;   
  totalAmount: number;
}

// ─────────────────────────────────────────────
//  Constants / theme
// ─────────────────────────────────────────────
const BRAND_DARK   = "#0F2341";   // deep navy
// const BRAND_MID    = "#1B4B82";   // medium navy
const BRAND_ACCENT = "#2563EB";   // blue
const GOLD         = "#B45309";   // amber / gold for policy box
const GOLD_BG      = "#FFFBEB";
const SUCCESS      = "#059669";
const TEXT_PRIMARY = "#111827";
const TEXT_MUTED   = "#6B7280";
const BORDER       = "#E5E7EB";
const BG_SURFACE   = "#F9FAFB";

const PAGE_W  = 595.28;  
const PAGE_H  = 841.89; 
const MARGIN  = 48;
const COL_W   = PAGE_W - MARGIN * 2;


function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fmtDate(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return raw;
  }
}

function fmtBDT(amount: number): string {
  return `${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT`;
}


function filledRect(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  color: string,
  radius = 0,
): void {
  const [r, g, b] = hexToRgb(color);
  doc.save().roundedRect(x, y, w, h, radius).fill([r, g, b]).restore();
}

function hLine(doc: PDFKit.PDFDocument, y: number, color = BORDER): void {
  const [r, g, b] = hexToRgb(color);
  doc.save().moveTo(MARGIN, y).lineTo(MARGIN + COL_W, y)
    .strokeColor([r, g, b]).lineWidth(0.5).stroke().restore();
}

function labelValue(
  doc: PDFKit.PDFDocument,
  y: number,
  label: string,
  value: string,
  valueColor = TEXT_PRIMARY,
  valueBold = false,
): number {
  const [lr, lg, lb] = hexToRgb(TEXT_MUTED);
  const [vr, vg, vb] = hexToRgb(valueColor);

  doc.fontSize(9).fillColor([lr, lg, lb]).font("Helvetica")
     .text(label, MARGIN + 12, y, { width: 180 });

  doc.fontSize(9)
     .fillColor([vr, vg, vb])
     .font(valueBold ? "Helvetica-Bold" : "Helvetica")
     .text(value, MARGIN + 200, y, { width: COL_W - 200, align: "right" });

  return y + 18;
}

// ─────────────────────────────────────────────
//  Section header
// ─────────────────────────────────────────────
function sectionLabel(doc: PDFKit.PDFDocument, y: number, text: string): number {
  const [r, g, b] = hexToRgb(TEXT_MUTED);
  doc.fontSize(7.5).fillColor([r, g, b]).font("Helvetica-Bold")
     .text(text.toUpperCase(), MARGIN, y, { characterSpacing: 1.2 });
  return y + 14;
}

// ─────────────────────────────────────────────
//  Main export
// ─────────────────────────────────────────────
export const generateHotelInvoicePdf = async (
  data: HotelBookingInvoiceData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0, info: {
        Title: `HotelBook Booking Receipt – ${data.bookingId}`,
        Author: "HotelBook",
        Subject: "Hotel Booking Invoice",
      }});

      const chunks: Buffer[] = [];
      doc.on("data",  (c) => chunks.push(c));
      doc.on("end",   () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      let y = 0;

      // ──────────────────────────────────────
      // 1. HEADER BAND  (dark navy block)
      // ──────────────────────────────────────
      const HEADER_H = 130;
      filledRect(doc, 0, 0, PAGE_W, HEADER_H, BRAND_DARK);

      // Brand name  ·  top-left
      doc.fontSize(15).font("Helvetica-Bold")
         .fillColor("#FFFFFF")
         .text("Hotel", MARGIN, 28);
      doc.fontSize(15).font("Helvetica")
         .fillColor("#60A5FA")
         .text("Book", MARGIN + 47, 28);

      // Booking ID  ·  top-right
      doc.fontSize(8).font("Helvetica").fillColor("rgba(255,255,255,0.5)")
         .text("BOOKING RECEIPT", MARGIN, 30, { width: COL_W, align: "right" });
      doc.fontSize(13).font("Helvetica-Bold").fillColor("#FFFFFF")
         .text(data.bookingId, MARGIN, 44, { width: COL_W, align: "right" });

      // "CONFIRMED" pill  ·  below booking id
      filledRect(doc, PAGE_W - MARGIN - 90, 66, 90, 18, "#1E3A5F", 9);
      doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#60A5FA")
         .text("● CONFIRMED", PAGE_W - MARGIN - 86, 70, { width: 82, align: "center", characterSpacing: 0.5 });

      // Hotel name / location strip  ·  bottom of header
      filledRect(doc, MARGIN, 94, COL_W, 28, "#17304F", 4);
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#FFFFFF")
         .text(data.hotelName, MARGIN + 12, 100, { width: 300 });
      doc.fontSize(8.5).font("Helvetica").fillColor("#94A3B8")
         .text(data.hotelLocation, MARGIN + 12, 113, { width: 300 });

      // Payment date  ·  right of hotel strip
      doc.fontSize(8).font("Helvetica").fillColor("#94A3B8")
         .text(fmtDate(data.paymentDate), MARGIN + 320, 107, { width: COL_W - 332, align: "right" });

      y = HEADER_H + 28;

      // ──────────────────────────────────────
      // 2. GREETING
      // ──────────────────────────────────────
      const [tp_r, tp_g, tp_b] = hexToRgb(TEXT_PRIMARY);
      const [tm_r, tm_g, tm_b] = hexToRgb(TEXT_MUTED);

      doc.fontSize(14).font("Helvetica-Bold").fillColor([tp_r, tp_g, tp_b])
         .text(`Hello, ${data.guestName}`, MARGIN, y);
      y += 18;

      doc.fontSize(9.5).font("Helvetica").fillColor([tm_r, tm_g, tm_b])
         .text(
           "Your booking is confirmed and payment has been processed. Here's a full summary of your reservation.",
           MARGIN, y, { width: COL_W }
         );
      y += 28;

      // ──────────────────────────────────────
      // 3. AMOUNT HERO CARD
      // ──────────────────────────────────────
      filledRect(doc, MARGIN, y, COL_W, 64, BG_SURFACE, 6);
      // left border accent
      filledRect(doc, MARGIN, y, 4, 64, BRAND_ACCENT, 2);

      doc.fontSize(8).font("Helvetica").fillColor([tm_r, tm_g, tm_b])
         .text("TOTAL CHARGED", MARGIN + 16, y + 14, { characterSpacing: 0.8 });
      doc.fontSize(22).font("Helvetica-Bold").fillColor([tp_r, tp_g, tp_b])
         .text(fmtBDT(data.totalAmount), MARGIN + 16, y + 26);

      // Right side – paid badge
      filledRect(doc, PAGE_W - MARGIN - 80, y + 16, 80, 28, "#ECFDF5", 5);
      const [sr, sg, sb] = hexToRgb(SUCCESS);
      doc.fontSize(10).font("Helvetica-Bold").fillColor([sr, sg, sb])
         .text("✓  PAID", PAGE_W - MARGIN - 80, y + 25, { width: 80, align: "center" });

      y += 80;

      // ──────────────────────────────────────
      // 4. TRANSACTION DETAILS
      // ──────────────────────────────────────
      y = sectionLabel(doc, y, "Transaction Details");
      hLine(doc, y - 2);

      const txRows: [string, string, string?, boolean?][] = [
        ["Booking ID",       data.bookingId,      "#60A5FA"],
        ["Transaction ID",   data.transactionId,  "#60A5FA"],
        ["Payment Date",     fmtDate(data.paymentDate)],
        ["Payment Status",   "Paid in Full",       SUCCESS, true],
      ];

      for (const [label, value, color, bold] of txRows) {
        if (y % 2 === 0) {  // alternating row tint
          filledRect(doc, MARGIN, y - 2, COL_W, 18, BG_SURFACE);
        }
        y = labelValue(doc, y, label, value, color ?? TEXT_PRIMARY, bold ?? false);
      }

      y += 14;
      hLine(doc, y);
      y += 18;

   
      y = sectionLabel(doc, y, "Stay Details");

      const HALF = (COL_W - 10) / 2;

      // Left card
      filledRect(doc, MARGIN, y, HALF, 72, BG_SURFACE, 5);
      doc.fontSize(7.5).font("Helvetica-Bold").fillColor([tm_r, tm_g, tm_b])
         .text("GUEST", MARGIN + 10, y + 10, { characterSpacing: 0.8 });
      doc.fontSize(10).font("Helvetica-Bold").fillColor([tp_r, tp_g, tp_b])
         .text(data.guestName, MARGIN + 10, y + 24);
      doc.fontSize(8.5).font("Helvetica").fillColor([tm_r, tm_g, tm_b])
         .text(data.guestEmail, MARGIN + 10, y + 38, { width: HALF - 20 });
      doc.fontSize(8.5).font("Helvetica").fillColor([tm_r, tm_g, tm_b])
         .text(
           `${data.guests} Guest${data.guests > 1 ? "s" : ""}`,
           MARGIN + 10, y + 52
         );

      // Right card
      const RX = MARGIN + HALF + 10;
      filledRect(doc, RX, y, HALF, 72, BG_SURFACE, 5);
      doc.fontSize(7.5).font("Helvetica-Bold").fillColor([tm_r, tm_g, tm_b])
         .text("ROOM", RX + 10, y + 10, { characterSpacing: 0.8 });
      doc.fontSize(10).font("Helvetica-Bold").fillColor([tp_r, tp_g, tp_b])
         .text(data.roomType, RX + 10, y + 24, { width: HALF - 20 });
      doc.fontSize(8.5).font("Helvetica").fillColor([tm_r, tm_g, tm_b])
         .text(
           `${data.nights} Night${data.nights > 1 ? "s" : ""}`,
           RX + 10, y + 52
         );

      y += 82;

      // Check-in / Check-out row
      filledRect(doc, MARGIN, y, HALF, 46, BG_SURFACE, 5);
      doc.fontSize(7.5).font("Helvetica-Bold").fillColor([tm_r, tm_g, tm_b])
         .text("CHECK-IN", MARGIN + 10, y + 8, { characterSpacing: 0.8 });
      doc.fontSize(10).font("Helvetica-Bold").fillColor([tp_r, tp_g, tp_b])
         .text(fmtDate(data.checkIn), MARGIN + 10, y + 22);

      filledRect(doc, RX, y, HALF, 46, BG_SURFACE, 5);
      doc.fontSize(7.5).font("Helvetica-Bold").fillColor([tm_r, tm_g, tm_b])
         .text("CHECK-OUT", RX + 10, y + 8, { characterSpacing: 0.8 });
      doc.fontSize(10).font("Helvetica-Bold").fillColor([tp_r, tp_g, tp_b])
         .text(fmtDate(data.checkOut), RX + 10, y + 22);

      y += 58;

      // ──────────────────────────────────────
      // 6. PRICE BREAKDOWN TABLE
      // ──────────────────────────────────────
      y = sectionLabel(doc, y, "Price Breakdown");

      const tableRows: { label: string; value: string; bold?: boolean; bg?: string; color?: string }[] = [
        {
          label: `Room Rate (${data.nights} night${data.nights > 1 ? "s" : ""} × ${fmtBDT(data.ratePerNight)})`,
          value: fmtBDT(data.nights * data.ratePerNight),
        },
        
        ...(data.discount && data.discount > 0
          ? [{ label: "Discount Applied", value: `– ${fmtBDT(data.discount)}`, color: SUCCESS }]
          : []),
        {
          label: "Total Charged",
          value: fmtBDT(data.totalAmount),
          bold: true,
          bg: BRAND_DARK,
          color: "#FFFFFF",
        },
      ];

      for (const row of tableRows) {
        const rowH = 22;
        const bg   = row.bg ?? (tableRows.indexOf(row) % 2 === 0 ? BG_SURFACE : "#FFFFFF");
        filledRect(doc, MARGIN, y, COL_W, rowH, bg, row.bold ? 5 : 0);

        const [lr, lg, lb] = row.bold
          ? hexToRgb("rgba(255,255,255,0.7)" as string)   // handled below
          : hexToRgb(TEXT_MUTED);
        const [vr, vg, vb] = hexToRgb(row.color ?? (row.bold ? "#FFFFFF" : TEXT_PRIMARY));

        // label
        doc.fontSize(9)
           .font(row.bold ? "Helvetica-Bold" : "Helvetica")
           .fillColor(row.bold ? "#CBD5E1" : [lr, lg, lb])
           .text(row.label, MARGIN + 12, y + 6, { width: 280 });

        // value
        doc.fontSize(9)
           .font(row.bold ? "Helvetica-Bold" : "Helvetica")
           .fillColor([vr, vg, vb])
           .text(row.value, MARGIN + 300, y + 6, { width: COL_W - 312, align: "right" });

        y += rowH;
      }

      y += 18;

      // ──────────────────────────────────────
      // 7. CANCELLATION POLICY BOX
      // ──────────────────────────────────────
      const policies = [
        "Free cancellation until 24 hours before check-in.",
        "Check-in: 2:00 PM  ·  Check-out: 12:00 PM (Noon)",
        "Valid government-issued photo ID required at the front desk.",
        "Pets and smoking are not permitted on the premises.",
      ];

      const POLICY_H = 20 + policies.length * 16 + 12;
      filledRect(doc, MARGIN, y, COL_W, POLICY_H, GOLD_BG, 6);
      // left accent bar
      filledRect(doc, MARGIN, y, 3, POLICY_H, GOLD, 2);

      const [gr, gg, gb] = hexToRgb(GOLD);
      doc.fontSize(8).font("Helvetica-Bold").fillColor([gr, gg, gb])
         .text("⚠  CANCELLATION & HOTEL POLICY", MARGIN + 12, y + 10, { characterSpacing: 0.4 });

      const [pr, pg, pb] = hexToRgb("#92400E");
      let py = y + 24;
      for (const p of policies) {
        doc.fontSize(8.5).font("Helvetica").fillColor([pr, pg, pb])
           .text(`•  ${p}`, MARGIN + 12, py, { width: COL_W - 24 });
        py += 16;
      }

      y += POLICY_H + 18;

      // ──────────────────────────────────────
      // 8. NEXT STEPS BOX
      // ──────────────────────────────────────
      filledRect(doc, MARGIN, y, COL_W, 50, "#EFF6FF", 6);
      filledRect(doc, MARGIN, y, 3, 50, BRAND_ACCENT, 2);

      const [br, bg2, bb] = hexToRgb("#1E40AF");
      doc.fontSize(9).font("Helvetica-Bold").fillColor([br, bg2, bb])
         .text("What happens next?", MARGIN + 12, y + 10);
      const [nb_r, nb_g, nb_b] = hexToRgb("#1D4ED8");
      doc.fontSize(8.5).font("Helvetica").fillColor([nb_r, nb_g, nb_b])
         .text(
           "Log in to your HotelBook dashboard to view full reservation details, add special requests, or manage your booking.",
           MARGIN + 12, y + 24, { width: COL_W - 24 }
         );

      y += 64;

      // ──────────────────────────────────────
      // 9. FOOTER BAND
      // ──────────────────────────────────────
      const FOOTER_Y = PAGE_H - 72;
      filledRect(doc, 0, FOOTER_Y, PAGE_W, 72, BRAND_DARK);

      // Brand
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#FFFFFF")
         .text("Hotel", MARGIN, FOOTER_Y + 18);
      doc.fontSize(11).font("Helvetica").fillColor("#60A5FA")
         .text("Book", MARGIN + 35, FOOTER_Y + 18);

      // Links
      doc.fontSize(8).font("Helvetica").fillColor("#64748B")
         .text("hotelbook.com  ·  support@hotelbook.com  ·  Privacy Policy",
               MARGIN, FOOTER_Y + 36, { width: COL_W });

      doc.fontSize(7.5).font("Helvetica").fillColor("#475569")
         .text(
           "© 2026 HotelBook. All rights reserved. This is an automatically generated document — please do not reply.",
           MARGIN, FOOTER_Y + 52, { width: COL_W }
         );

      // Right – "Electronically generated" stamp
      doc.fontSize(7).font("Helvetica").fillColor("#334155")
         .text("Electronically generated", PAGE_W - MARGIN - 120, FOOTER_Y + 18, { width: 120, align: "right" });
      doc.fontSize(7).font("Helvetica").fillColor("#334155")
         .text("No signature required", PAGE_W - MARGIN - 120, FOOTER_Y + 28, { width: 120, align: "right" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};