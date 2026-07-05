import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { MiniCart } from '@/components/shared/MiniCart';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ROUTES } from '@/constants/routes';

const navItems = [
  { label: 'Shop', href: ROUTES.products },
  { label: 'Deals', href: '/products?tag=deals' },
  { label: 'Combos', href: '/products?collection=combos' },
  { label: 'New', href: '/products?tag=new-arrivals' },
];

export function SiteHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    navigate(`${ROUTES.products}?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="border-b bg-foreground py-2 text-xs font-medium text-background">
          <div className="container flex items-center justify-between gap-4">
            <span>Free delivery above INR 999</span>
            <span className="hidden sm:inline">Fresh batches shipped across India</span>
          </div>
        </div>

        <div className="container flex h-20 items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to={ROUTES.home} className="mr-2 text-xl font-black tracking-tight">
            SnackCo
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href} className="transition hover:text-primary">
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            className="ml-auto hidden max-w-md flex-1 items-center md:flex"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearchSubmit(searchQuery);
            }}
          >
            <label htmlFor="site-search" className="sr-only">
              Search snacks
            </label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="site-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search popcorn, chips, combos..."
                className="h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open mini cart"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                2
              </span>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Profile">
              <Link to={ROUTES.login}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {isMobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-foreground/40"
              aria-label="Close menu"
              onClick={() => setIsMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-80 max-w-[88vw] bg-background p-5 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <Link
                  to={ROUTES.home}
                  className="text-xl font-black"
                  onClick={() => setIsMobileOpen(false)}
                >
                  SnackCo
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close menu"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form
                className="mb-6"
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSearchSubmit(mobileSearchQuery);
                  setIsMobileOpen(false);
                }}
              >
                <label htmlFor="mobile-site-search" className="sr-only">
                  Search snacks
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="mobile-site-search"
                    type="search"
                    value={mobileSearchQuery}
                    onChange={(event) => setMobileSearchQuery(event.target.value)}
                    placeholder="Search snacks..."
                    className="h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </form>
              <nav className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="rounded-md px-3 py-3 text-base font-semibold hover:bg-muted"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        ) : null}
      </header>

      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
