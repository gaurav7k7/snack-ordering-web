export type DashboardStats = {
  revenue: { total: number; today: number; monthly: number; yearly: number };
  orders: {
    total: number;
    pending: number;
    delivered: number;
    cancelled: number;
    refunded: number;
    today: number;
  };
  customers: { total: number; active: number };
  catalog: {
    products: number;
    categories: number;
    brands: number;
    lowStock: number;
    outOfStock: number;
  };
  coupons: { total: number; active: number };
  reviews: { total: number; averageRating: number };
  salesGraph: Array<{ date: string; revenue: number; orders: number }>;
  topSellingProducts: Array<{
    _id: string;
    name: string;
    image?: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  latestOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    guestName?: string;
    guestEmail?: string;
    createdAt: string;
  }>;
  recentCustomers: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
  }>;
  notifications: Array<{ type: 'warning' | 'info' | 'success'; message: string }>;
};
