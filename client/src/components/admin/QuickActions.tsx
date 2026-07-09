import { Boxes, Package, Plus, ShoppingBag, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

const ACTIONS = [
  { label: 'Add Product', description: 'Create a new catalog listing', href: ROUTES.adminProductNew, icon: Plus },
  { label: 'Manage Inventory', description: 'Update stock and track low/out of stock', href: ROUTES.adminInventory, icon: Boxes },
  { label: 'Manage Orders', description: 'Update order status and track fulfillment', href: ROUTES.adminOrders, icon: Package },
  { label: 'Manage Coupons', description: 'Create and manage discount codes', href: ROUTES.adminCoupons, icon: Tag },
  { label: 'View Storefront', description: 'See what customers see', href: ROUTES.home, icon: ShoppingBag },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            to={action.href}
            className="group rounded-2xl border border-border/70 bg-background p-4 transition hover:border-primary/50 hover:shadow-sm"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-sm font-semibold">{action.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
