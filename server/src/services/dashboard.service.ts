import { LOW_STOCK_THRESHOLD } from '../constants/inventory.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import { USER_ROLES } from '../constants/roles.js';
import { CategoryModel } from '../models/Category.model.js';
import { CouponModel } from '../models/Coupon.model.js';
import { OrderModel } from '../models/Order.model.js';
import { ProductModel } from '../models/Product.model.js';
import { UserModel } from '../models/User.model.js';

const REVENUE_EXCLUDED_STATUSES: string[] = [
  ORDER_STATUS.pending,
  ORDER_STATUS.cancelled,
  ORDER_STATUS.refunded,
];
const RECENT_LIST_LIMIT = 8;
const SALES_GRAPH_DAYS = 30;
const TOP_PRODUCTS_LIMIT = 5;

// All "start of X" boundaries are computed in UTC to match how order
// timestamps are stored and how MongoDB's $dateToString buckets them —
// local-time Date methods would drift by the server's UTC offset.
function startOfToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function startOfMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function startOfYear() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
}

async function sumRevenue(createdAfter?: Date) {
  const match: Record<string, unknown> = { status: { $nin: REVENUE_EXCLUDED_STATUSES } };
  if (createdAfter) {
    match.createdAt = { $gte: createdAfter };
  }

  const result = await OrderModel.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  return result[0]?.total ?? 0;
}

async function getSalesGraph() {
  // MongoDB's $dateToString buckets by UTC calendar date by default, so every
  // boundary here must be computed in UTC too (Date.UTC / getUTC*) — mixing in
  // local-time Date methods (setDate/setHours) shifts the whole window by a day
  // whenever the server's local timezone isn't UTC.
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startUtc = todayUtc - (SALES_GRAPH_DAYS - 1) * 86_400_000;

  const results = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: new Date(startUtc) }, status: { $nin: REVENUE_EXCLUDED_STATUSES } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
  ]);

  const byDate = new Map(results.map((entry) => [entry._id, entry]));
  const days: Array<{ date: string; revenue: number; orders: number }> = [];

  for (let i = 0; i < SALES_GRAPH_DAYS; i += 1) {
    const key = new Date(startUtc + i * 86_400_000).toISOString().slice(0, 10);
    const entry = byDate.get(key);
    days.push({ date: key, revenue: entry?.revenue ?? 0, orders: entry?.orders ?? 0 });
  }

  return days;
}

async function getTopSellingProducts() {
  return OrderModel.aggregate([
    { $match: { status: { $ne: ORDER_STATUS.cancelled } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        image: { $first: '$items.image' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: TOP_PRODUCTS_LIMIT },
  ]);
}

function buildNotifications(context: {
  lowStockCount: number;
  outOfStockCount: number;
  pendingOrders: number;
  pendingReturnRequests: number;
}) {
  const notifications: Array<{ type: 'warning' | 'info' | 'success'; message: string }> = [];

  if (context.outOfStockCount > 0) {
    notifications.push({
      type: 'warning',
      message: `${context.outOfStockCount} product${context.outOfStockCount > 1 ? 's are' : ' is'} out of stock.`,
    });
  }
  if (context.lowStockCount > 0) {
    notifications.push({
      type: 'warning',
      message: `${context.lowStockCount} product${context.lowStockCount > 1 ? 's are' : ' is'} running low on stock.`,
    });
  }
  if (context.pendingOrders > 0) {
    notifications.push({
      type: 'info',
      message: `${context.pendingOrders} order${context.pendingOrders > 1 ? 's are' : ' is'} awaiting confirmation.`,
    });
  }
  if (context.pendingReturnRequests > 0) {
    notifications.push({
      type: 'info',
      message: `${context.pendingReturnRequests} return request${context.pendingReturnRequests > 1 ? 's need' : ' needs'} review.`,
    });
  }
  if (notifications.length === 0) {
    notifications.push({ type: 'success', message: "All caught up! Nothing urgent right now." });
  }

  return notifications;
}

export async function getDashboardStats() {
  const today = startOfToday();
  const monthStart = startOfMonth();
  const yearStart = startOfYear();

  const [
    totalRevenue,
    todayRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    refundedOrders,
    todaysOrders,
    totalCustomers,
    activeCustomers,
    totalProducts,
    totalCategories,
    brands,
    lowStockCount,
    outOfStockCount,
    totalCoupons,
    activeCoupons,
    reviewStatsAgg,
    salesGraph,
    topSellingProducts,
    latestOrders,
    recentCustomers,
    pendingReturnRequests,
  ] = await Promise.all([
    sumRevenue(),
    sumRevenue(today),
    sumRevenue(monthStart),
    sumRevenue(yearStart),
    OrderModel.countDocuments(),
    OrderModel.countDocuments({ status: ORDER_STATUS.pending }),
    OrderModel.countDocuments({ status: ORDER_STATUS.delivered }),
    OrderModel.countDocuments({ status: ORDER_STATUS.cancelled }),
    OrderModel.countDocuments({ status: ORDER_STATUS.refunded }),
    OrderModel.countDocuments({ createdAt: { $gte: today } }),
    UserModel.countDocuments({ role: USER_ROLES.customer }),
    UserModel.countDocuments({ role: USER_ROLES.customer, isActive: true }),
    ProductModel.countDocuments(),
    CategoryModel.countDocuments(),
    ProductModel.distinct('brand'),
    ProductModel.countDocuments({ availableQuantity: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
    ProductModel.countDocuments({ availableQuantity: { $lte: 0 } }),
    CouponModel.countDocuments(),
    CouponModel.countDocuments({ isActive: true }),
    ProductModel.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: '$reviewCount' },
          avgRating: { $avg: '$averageRating' },
        },
      },
    ]),
    getSalesGraph(),
    getTopSellingProducts(),
    OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_LIST_LIMIT)
      .select('orderNumber total status createdAt guestName guestEmail')
      .lean(),
    UserModel.find({ role: USER_ROLES.customer })
      .sort({ createdAt: -1 })
      .limit(RECENT_LIST_LIMIT)
      .select('name email avatar createdAt')
      .lean(),
    OrderModel.countDocuments({ status: ORDER_STATUS.return_requested }),
  ]);

  return {
    revenue: {
      total: totalRevenue,
      today: todayRevenue,
      monthly: monthlyRevenue,
      yearly: yearlyRevenue,
    },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      refunded: refundedOrders,
      today: todaysOrders,
    },
    customers: {
      total: totalCustomers,
      active: activeCustomers,
    },
    catalog: {
      products: totalProducts,
      categories: totalCategories,
      brands: brands.filter(Boolean).length,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    },
    coupons: {
      total: totalCoupons,
      active: activeCoupons,
    },
    reviews: {
      total: reviewStatsAgg[0]?.totalReviews ?? 0,
      averageRating: Math.round((reviewStatsAgg[0]?.avgRating ?? 0) * 10) / 10,
    },
    salesGraph,
    topSellingProducts,
    latestOrders,
    recentCustomers,
    notifications: buildNotifications({
      lowStockCount,
      outOfStockCount,
      pendingOrders,
      pendingReturnRequests,
    }),
  };
}
