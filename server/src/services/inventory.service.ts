import { LOW_STOCK_THRESHOLD } from '../constants/inventory.js';
import { USER_ROLES } from '../constants/roles.js';
import { ProductModel } from '../models/Product.model.js';
import { UserModel } from '../models/User.model.js';
import { renderEmailHtml } from '../utils/emailTemplates.js';
import { sendEmail } from './email.service.js';

type StockAlert = { name: string; sku: string; previousQuantity: number; newQuantity: number };

export async function decrementStockAndAlert(items: Array<{ productId: unknown; quantity: number }>) {
  const alerts: StockAlert[] = [];

  await Promise.all(
    items.map(async (item) => {
      const product = await ProductModel.findById(item.productId as string);
      if (!product) return;

      const previousQuantity = product.availableQuantity;
      const nextQuantity = Math.max(previousQuantity - item.quantity, 0);
      product.availableQuantity = nextQuantity;
      product.stock = Math.max(product.stock - item.quantity, 0);
      await product.save();

      const justRanOut = previousQuantity > 0 && nextQuantity === 0;
      const justCrossedThreshold = previousQuantity > LOW_STOCK_THRESHOLD && nextQuantity <= LOW_STOCK_THRESHOLD;

      if (justRanOut || justCrossedThreshold) {
        alerts.push({ name: product.name, sku: product.sku, previousQuantity, newQuantity: nextQuantity });
      }
    }),
  );

  if (alerts.length > 0) {
    await sendLowStockAlertEmail(alerts);
  }
}

async function sendLowStockAlertEmail(alerts: StockAlert[]) {
  const admins = await UserModel.find({ role: USER_ROLES.admin }).select('email');
  const recipients = admins.map((admin) => admin.email).filter(Boolean);
  if (recipients.length === 0) return;

  const rows = alerts
    .map(
      (alert) => `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${alert.name} <span style="color:#9ca3af;">(${alert.sku})</span></td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${alert.previousQuantity} &rarr; ${alert.newQuantity === 0 ? '<strong style="color:#dc2626;">Out of stock</strong>' : alert.newQuantity}</td>
      </tr>`,
    )
    .join('');

  const html = await renderEmailHtml(
    'Low stock alert',
    `<p>The following product${alerts.length > 1 ? 's' : ''} need restocking soon:</p>
     <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;">
       <thead>
         <tr>
           <th style="text-align:left;padding:8px 10px;color:#6b7280;">Product</th>
           <th style="text-align:right;padding:8px 10px;color:#6b7280;">Stock</th>
         </tr>
       </thead>
       <tbody>${rows}</tbody>
     </table>`,
  );

  const text = `Low stock alert:\n${alerts
    .map((alert) => `${alert.name} (${alert.sku}): ${alert.previousQuantity} -> ${alert.newQuantity}`)
    .join('\n')}`;

  await Promise.all(
    recipients.map((to) =>
      sendEmail({
        to,
        subject: `Low stock alert — ${alerts.length} product${alerts.length > 1 ? 's' : ''} need attention`,
        text,
        html,
      }),
    ),
  );
}
