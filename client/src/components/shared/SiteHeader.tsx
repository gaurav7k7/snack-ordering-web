import { Heart, LogOut, Menu, ShoppingBag, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useWishlist } from '@/hooks/useWishlist';

import { Button } from '@/components/ui/button';
import { AnnouncementBar } from '@/components/shared/AnnouncementBar';
import { CountBadge } from '@/components/shared/CountBadge';
import { HeaderSearchForm } from '@/components/shared/HeaderSearchForm';
import { MiniCart } from '@/components/shared/MiniCart';
import { MobileNavDrawer } from '@/components/shared/MobileNavDrawer';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { SITE_NAV_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useLogoutMutation } from '@/redux/api/authApi';
import { clearUser } from '@/redux/slices/authSlice';
import { cn } from '@/utils/cn';

export function SiteHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

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

  const handleLogout = async () => {
    setIsAccountMenuOpen(false);
    setIsMobileOpen(false);
    try {
      await logout().unwrap();
    } catch {
      // ignore network errors on logout — clear local state regardless
    }
    dispatch(clearUser());
    navigate(ROUTES.home);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 border-b backdrop-blur-xl transition-shadow duration-300',
          isScrolled ? 'bg-background/95 shadow-soft' : 'bg-background/90 shadow-none',
        )}
      >
        <AnnouncementBar />

        <div className="container flex h-20 items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label="Open menu"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to={ROUTES.home} className="mr-2 text-xl font-black tracking-tight">
            Lotus Delight
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold xl:flex">
            {SITE_NAV_ITEMS.map((item) => (
              <Link key={item.label} to={item.href} className="transition hover:text-primary">
                {item.label}
              </Link>
            ))}
          </nav>

          <HeaderSearchForm
            id="site-search"
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={(event) => {
              event.preventDefault();
              handleSearchSubmit(searchQuery);
            }}
            isVoiceSupported={voiceSearch.isSupported}
            isVoiceListening={voiceSearch.isListening}
            onToggleVoice={() => (voiceSearch.isListening ? voiceSearch.stop() : voiceSearch.start())}
            className="ml-auto hidden max-w-md flex-1 xl:flex"
          />

          <div className="ml-auto flex items-center gap-1 xl:ml-0">
            <ThemeToggle className="hidden xl:inline-flex" />
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Wishlist"
              className="relative hidden xl:inline-flex"
            >
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
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Account menu"
                  aria-expanded={isAccountMenuOpen}
                  onClick={() => setIsAccountMenuOpen((open) => !open)}
                >
                  <User className="h-5 w-5" />
                </Button>
                {isAccountMenuOpen ? (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      aria-label="Close account menu"
                      onClick={() => setIsAccountMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border bg-card p-1.5 shadow-xl">
                      <Link
                        to={ROUTES.profile}
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted"
                      >
                        <User className="h-4 w-4" /> My account
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <Button asChild variant="ghost" size="icon" aria-label="Login">
                <Link to={ROUTES.login}>
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="container pb-3 xl:hidden">
          <HeaderSearchForm
            id="site-search-mobile"
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={(event) => {
              event.preventDefault();
              handleSearchSubmit(searchQuery);
            }}
            isVoiceSupported={voiceSearch.isSupported}
            isVoiceListening={voiceSearch.isListening}
            onToggleVoice={() => (voiceSearch.isListening ? voiceSearch.stop() : voiceSearch.start())}
          />
        </div>
      </header>

      <MobileNavDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
