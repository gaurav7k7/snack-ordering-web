import PDFDocument from 'pdfkit';

type InvoiceOrder = {
  orderNumber: string;
  createdAt: Date;
  status: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  user?: { name?: string; email?: string; phone?: string } | string | null;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
  automaticOfferCode?: string;
  automaticDiscount?: number;
  payment?: { provider?: string; status?: string; razorpayPaymentId?: string };
};

const currency = (value: number) => `Rs. ${value.toFixed(2)}`;
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function generateInvoicePdf(order: InvoiceOrder): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const customer = typeof order.user === 'object' && order.user ? order.user : undefined;
  const address = order.shippingAddress;
  const customerName = customer?.name || address?.fullName || order.guestName || 'Customer';
  const customerPhone = address?.phone || customer?.phone || order.guestPhone || 'Not provided';
  const customerEmail = customer?.email || order.guestEmail || 'Not provided';

  doc.fontSize(20).font('Helvetica-Bold').fillColor('#000').text('Lotus Delight');
  doc.fontSize(10).font('Helvetica').fillColor('#666').text('Premium snacks, delivered fast.');
  doc.moveDown(1.5);

  doc.fillColor('#000').fontSize(16).font('Helvetica-Bold').text('Tax Invoice');
  doc.moveDown(0.75);

  const detailsTop = doc.y;
  const leftX = 50;
  const rightX = 300;

  doc.font('Helvetica-Bold').fontSize(11).text('Order details', leftX, detailsTop);
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(`Order number: ${order.orderNumber}`, leftX, detailsTop + 16)
    .text(`Order date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`)
    .text(`Order status: ${capitalize(order.status)}`);

  doc.font('Helvetica-Bold').fontSize(11).text('Customer details', rightX, detailsTop);
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(`Name: ${customerName}`, rightX, detailsTop + 16, { width: 245 })
    .text(`Phone: ${customerPhone}`, rightX, doc.y, { width: 245 })
    .text(`Email: ${customerEmail}`, rightX, doc.y, { width: 245 });

  doc.moveDown(1.5);
  doc.x = leftX;

  const addressTop = doc.y;
  doc.font('Helvetica-Bold').fontSize(11).text('Shipping address', leftX, addressTop);
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(
      address
        ? [address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
            .filter(Boolean)
            .join(', ')
        : 'Not provided',
      leftX,
      addressTop + 16,
      { width: 495 },
    );

  doc.moveDown(1);
  doc.x = leftX;

  const paymentTop = doc.y;
  const paymentMethod = order.payment?.provider === 'razorpay' ? 'Online payment (Razorpay)' : 'Cash on delivery';
  doc.font('Helvetica-Bold').fontSize(11).text('Payment information', leftX, paymentTop);
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(`Method: ${paymentMethod}`, leftX, paymentTop + 16)
    .text(`Status: ${capitalize(order.payment?.status ?? 'pending')}`);
  if (order.payment?.razorpayPaymentId) {
    doc.text(`Payment ID: ${order.payment.razorpayPaymentId}`);
  }

  doc.moveDown(1.5);
  doc.x = leftX;

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
    ...(order.couponCode && order.couponDiscount
      ? [[`Coupon (${order.couponCode})`, `-${currency(order.couponDiscount)}`] as [string, string]]
      : []),
    ...(order.automaticOfferCode && order.automaticDiscount
      ? [[`Automatic offer (${order.automaticOfferCode})`, `-${currency(order.automaticDiscount)}`] as [
          string,
          string,
        ]]
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
    .text('Thank you for shopping with Lotus Delight. This is a system-generated invoice.', 50, doc.y, {
      align: 'center',
      width: 495,
    });

  return doc;
}
