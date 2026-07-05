import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to={ROUTES.home} className="text-lg font-bold">
          SnackCo
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link to={ROUTES.products}>Shop</Link>
          <Link to={ROUTES.cart}>Cart</Link>
        </nav>
        <Button asChild size="sm">
          <Link to={ROUTES.login}>Sign in</Link>
        </Button>
      </div>
    </header>
  );
}
