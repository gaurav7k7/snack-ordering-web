import PDFDocument from 'pdfkit';

type InvoiceOrder = {
  orderNumber: string;
  createdAt: Date;
  items: Array<{ name: string; price: number; quantity: number }>;
  shippingAddress?: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  guestName?: string;
  guestEmail?: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  giftCouponCode?: string;
  payment?: { provider?: string; status?: string };
};

const currency = (value: number) => `Rs. ${value.toFixed(2)}`;

export function generateInvoicePdf(order: InvoiceOrder): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.fontSize(20).font('Helvetica-Bold').text('SnackCo', { continued: false });
  doc.fontSize(10).font('Helvetica').fillColor('#666').text('Premium snacks, delivered fast.');
  doc.moveDown(1.5);

  doc.fillColor('#000').fontSize(16).font('Helvetica-Bold').text('Tax Invoice');
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Order number: ${order.orderNumber}`)
    .text(`Order date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`)
    .text(`Payment method: ${order.payment?.provider === 'razorpay' ? 'Online payment' : 'Cash on delivery'}`)
    .text(`Payment status: ${order.payment?.status ?? 'pending'}`);
  doc.moveDown(1);

  const address = order.shippingAddress;
  doc.font('Helvetica-Bold').text('Billed to');
  doc
    .font('Helvetica')
    .text(address?.fullName || order.guestName || '—')
    .text(order.guestEmail ?? '')
    .text(
      [address?.line1, address?.line2, address?.city, address?.state, address?.postalCode, address?.country]
        .filter(Boolean)
        .join(', '),
    );
  doc.moveDown(1.5);

  const tableTop = doc.y;
  const columns = { name: 50, qty: 300, price: 370, total: 460 };

  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Item', columns.name, tableTop);
  doc.text('Qty', columns.qty, tableTop);
  doc.text('Price', columns.price, tableTop);
  doc.text('Amount', columns.total, tableTop);
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(545, tableTop + 15)
    .strokeColor('#ccc')
    .stroke();

  let cursorY = tableTop + 22;
  doc.font('Helvetica').fontSize(10);
  order.items.forEach((item) => {
    doc.text(item.name, columns.name, cursorY, { width: 240 });
    doc.text(String(item.quantity), columns.qty, cursorY);
    doc.text(currency(item.price), columns.price, cursorY);
    doc.text(currency(item.price * item.quantity), columns.total, cursorY);
    cursorY += 20;
  });

  doc
    .moveTo(50, cursorY + 5)
    .lineTo(545, cursorY + 5)
    .strokeColor('#ccc')
    .stroke();
  cursorY += 15;

  const summaryLines: Array<[string, string]> = [
    ['Subtotal', currency(order.subtotal)],
    ...(order.couponCode ? [['Coupon (' + order.couponCode + ')', 'Applied'] as [string, string]] : []),
    ...(order.giftCouponCode
      ? [['Gift coupon (' + order.giftCouponCode + ')', 'Applied'] as [string, string]]
      : []),
    ['Shipping', order.shippingFee === 0 ? 'Free' : currency(order.shippingFee)],
    ['Tax (GST)', currency(order.tax)],
  ];

  summaryLines.forEach(([label, value]) => {
    doc.text(label, columns.price - 80, cursorY);
    doc.text(value, columns.total, cursorY);
    cursorY += 18;
  });

  doc.font('Helvetica-Bold').fontSize(12);
  doc.text('Total', columns.price - 80, cursorY);
  doc.text(currency(order.total), columns.total, cursorY);

  doc.moveDown(4);
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#999')
    .text('Thank you for shopping with SnackCo. This is a system-generated invoice.', 50, doc.y, {
      align: 'center',
      width: 495,
    });

  return doc;
}
