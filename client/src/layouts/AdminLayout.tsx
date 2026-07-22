import {
  Boxes,
  Building2,
  GalleryHorizontal,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useLogoutMutation } from '@/redux/api/authApi';
import { clearUser } from '@/redux/slices/authSlice';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.adminDashboard, icon: LayoutDashboard },
  { label: 'Products', href: ROUTES.adminProducts, icon: Package },
  { label: 'Inventory', href: ROUTES.adminInventory, icon: Boxes },
  { label: 'Categories', href: ROUTES.adminCategories, icon: LayoutGrid },
  { label: 'Orders', href: ROUTES.adminOrders, icon: ShoppingBag },
  { label: 'Coupons', href: ROUTES.adminCoupons, icon: Tag },
  { label: 'Customers', href: ROUTES.adminCustomers, icon: Users },
  { label: 'Reviews', href: ROUTES.adminReviews, icon: Star },
  { label: 'Newsletter', href: ROUTES.adminNewsletter, icon: Mail },
  { label: 'Messages', href: ROUTES.adminMessages, icon: MessageSquare },
  { label: 'Banners', href: ROUTES.adminBanners, icon: GalleryHorizontal },
  { label: 'B2B & Media Logos', href: ROUTES.adminPartnerLogos, icon: Building2 },
  { label: 'Settings', href: ROUTES.adminSettings, icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border/70 px-6">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
          S
        </div>
        <span className="text-lg font-black tracking-tight">Lotus Delight Admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/70 p-4 text-xs text-muted-foreground">
        Lotus Delight Admin Panel
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // ignore network errors on logout — clear local state regardless
    }
    dispatch(clearUser());
    navigate(ROUTES.login);
  };

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border/70 bg-card lg:block">
        <SidebarContent />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto overscroll-contain bg-card shadow-2xl">
            <div className="flex justify-end p-3">
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setIsMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent onNavigate={() => setIsMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
          <div className="flex items-center gap-3 border-l border-border/70 pl-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {(user?.name ?? 'A').charAt(0).toUpperCase()}
            </div>
            <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
