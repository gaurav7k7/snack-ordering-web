import { ROUTES } from '@/constants/routes';

export const SITE_NAV_ITEMS = [
  { label: 'Shop', href: ROUTES.products },
  { label: 'Deals', href: '/products?tag=deals' },
  { label: 'Combos', href: '/products?collection=combos' },
  { label: 'New', href: '/products?tag=new-arrivals' },
];
