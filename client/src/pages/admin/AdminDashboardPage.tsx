import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  IndianRupee,
  LayoutGrid,
  MessageSquare,
  Package,
  PackageX,
  ShoppingBag,
  Star,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { DashboardCard } from '@/components/admin/DashboardCard';
import { LatestOrdersList } from '@/components/admin/LatestOrdersList';
import { NotificationsPanel } from '@/components/admin/NotificationsPanel';
import { OrderStatusChart } from '@/components/admin/OrderStatusChart';
import { QuickActions } from '@/components/admin/QuickActions';
import { RecentCustomersList } from '@/components/admin/RecentCustomersList';
import { SalesChart } from '@/components/admin/SalesChart';
import { StatCard } from '@/components/admin/StatCard';
import { TopSellingProducts } from '@/components/admin/TopSellingProducts';
import { TrafficPlaceholder } from '@/components/admin/TrafficPlaceholder';
import { useGetDashboardQuery } from '@/redux/api/dashboardApi';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatCompactNumber } from '@/utils/formatCompactNumber';

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{children}</p>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery();
  const stats = data?.data;

  return (
    <section className="space-y-8">
      <Helmet>
        <title>Admin Dashboard | SnackCo</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A live snapshot of revenue, orders, customers, and catalog health.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      ) : isError || !stats ? (
        <p className="text-sm text-destructive">Unable to load dashboard data.</p>
      ) : (
        <>
          <div>
            <SectionLabel>Revenue</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Revenue" value={formatCurrency(stats.revenue.total)} icon={IndianRupee} />
              <StatCard label="Today's Revenue" value={formatCurrency(stats.revenue.today)} icon={CalendarClock} />
              <StatCard label="Monthly Revenue" value={formatCurrency(stats.revenue.monthly)} icon={CalendarRange} />
              <StatCard label="Yearly Revenue" value={formatCurrency(stats.revenue.yearly)} icon={TrendingUp} />
            </div>
          </div>

          <div>
            <SectionLabel>Orders</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Total Orders" value={formatCompactNumber(stats.orders.total)} icon={ShoppingBag} />
              <StatCard label="Pending" value={stats.orders.pending} icon={Clock3} tone="warning" />
              <StatCard label="Delivered" value={stats.orders.delivered} icon={CheckCircle2} tone="good" />
              <StatCard label="Cancelled" value={stats.orders.cancelled} icon={XCircle} tone="critical" />
              <StatCard label="Refunded" value={stats.orders.refunded} icon={Package} tone="serious" />
              <StatCard label="Today's Orders" value={stats.orders.today} icon={CalendarDays} />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <SectionLabel>Customers</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label="Customers" value={formatCompactNumber(stats.customers.total)} icon={Users} />
                <StatCard label="Active Users" value={formatCompactNumber(stats.customers.active)} icon={UserCheck} tone="good" />
              </div>
            </div>
            <div>
              <SectionLabel>Catalog</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label="Products" value={stats.catalog.products} icon={Package} />
                <StatCard label="Categories" value={stats.catalog.categories} icon={LayoutGrid} />
              </div>
            </div>
            <div>
              <SectionLabel>Coupons &amp; Reviews</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label="Coupons" value={stats.coupons.total} icon={Ticket} hint={`${stats.coupons.active} active`} />
                <StatCard label="Avg. Rating" value={stats.reviews.averageRating.toFixed(1)} icon={Star} hint={`${stats.reviews.total} reviews`} />
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Inventory</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Brands" value={stats.catalog.brands} icon={Building2} />
              <StatCard
                label="Low Stock"
                value={stats.catalog.lowStock}
                icon={AlertTriangle}
                tone={stats.catalog.lowStock > 0 ? 'warning' : 'default'}
              />
              <StatCard
                label="Out of Stock"
                value={stats.catalog.outOfStock}
                icon={PackageX}
                tone={stats.catalog.outOfStock > 0 ? 'critical' : 'default'}
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <DashboardCard
              title="Sales, last 30 days"
              description="Revenue and order volume for eligible (non-cancelled, non-refunded) orders"
              className="xl:col-span-2"
            >
              <SalesChart data={stats.salesGraph} />
            </DashboardCard>
            <DashboardCard title="Order status breakdown">
              <OrderStatusChart
                pending={stats.orders.pending}
                delivered={stats.orders.delivered}
                cancelled={stats.orders.cancelled}
                refunded={stats.orders.refunded}
              />
            </DashboardCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <DashboardCard title="Latest orders" className="xl:col-span-2">
              <LatestOrdersList orders={stats.latestOrders} />
            </DashboardCard>
            <DashboardCard title="Notifications" description="Auto-generated from current store state">
              <NotificationsPanel notifications={stats.notifications} />
            </DashboardCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <DashboardCard title="Top selling products">
              <TopSellingProducts products={stats.topSellingProducts} />
            </DashboardCard>
            <DashboardCard title="Recent customers">
              <RecentCustomersList customers={stats.recentCustomers} />
            </DashboardCard>
            <DashboardCard title="Traffic" description="Placeholder">
              <TrafficPlaceholder />
            </DashboardCard>
          </div>

          <DashboardCard title="Quick actions">
            <QuickActions />
          </DashboardCard>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Review count and average rating are computed live across the product catalog.
          </p>
        </>
      )}
    </section>
  );
}
