import { Heart, Menu, Mic, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAppSelector } from '@/hooks/redux';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useWishlist } from '@/hooks/useWishlist';

import { Button } from '@/components/ui/button';
import { CountBadge } from '@/components/shared/CountBadge';
import { MiniCart } from '@/components/shared/MiniCart';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const cartItemCount = useAppSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0),
  );
  const { count: wishlistCount } = useWishlist();

  const handleSearchSubmit = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    navigate(`${ROUTES.products}?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleVoiceResult = useCallback(
    (transcript: string) => {
      setSearchQuery(transcript);
      const trimmedQuery = transcript.trim();
      if (trimmedQuery) navigate(`${ROUTES.products}?q=${encodeURIComponent(trimmedQuery)}`);
    },
    [navigate],
  );
  const voiceSearch = useVoiceSearch(handleVoiceResult);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 border-b backdrop-blur-xl transition-shadow duration-300',
          isScrolled ? 'bg-background/95 shadow-soft' : 'bg-background/90 shadow-none',
        )}
      >
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
                className={cn(
                  'h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20',
                  voiceSearch.isSupported && 'pr-10',
                )}
              />
              {voiceSearch.isSupported ? (
                <button
                  type="button"
                  aria-label={voiceSearch.isListening ? 'Listening…' : 'Search by voice'}
                  onClick={() => (voiceSearch.isListening ? voiceSearch.stop() : voiceSearch.start())}
                  className={cn(
                    'absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-primary',
                    voiceSearch.isListening && 'animate-pulse text-primary',
                  )}
                >
                  <Mic className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon" aria-label="Wishlist" className="relative">
              <Link to={isAuthenticated ? ROUTES.wishlist : ROUTES.login}>
                <Heart className="h-5 w-5" />
                <CountBadge count={wishlistCount} />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open mini cart"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              <CountBadge count={cartItemCount} />
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Profile">
              <Link to={isAuthenticated ? ROUTES.profile : ROUTES.login}>
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
                {isAuthenticated ? (
                  <Link
                    to={ROUTES.profile}
                    className="rounded-md px-3 py-3 text-base font-semibold hover:bg-muted"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    My account
                  </Link>
                ) : null}
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
