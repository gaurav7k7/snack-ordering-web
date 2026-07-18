import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart, LogOut, Search, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { SITE_NAV_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useLogoutMutation } from '@/redux/api/authApi';
import { clearUser } from '@/redux/slices/authSlice';
import { useWishlist } from '@/hooks/useWishlist';

type MobileNavDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const { count: wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const prefersReducedMotion = useReducedMotion();

  // Lock background scroll while the drawer is open — without this the page
  // behind it can still scroll on touch devices, which reads as a UI glitch.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();
    onClose();
    if (!trimmedQuery) return;
    navigate(`${ROUTES.products}?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleLogout = async () => {
    onClose();
    try {
      await logout().unwrap();
    } catch {
      // ignore network errors on logout — clear local state regardless
    }
    dispatch(clearUser());
    navigate(ROUTES.home);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <motion.button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            className="absolute left-0 top-0 flex h-full w-80 max-w-[88vw] flex-col bg-background shadow-2xl"
            initial={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between gap-2 border-b p-5">
              <Link to={ROUTES.home} className="text-xl font-black" onClick={onClose}>
                Lotus Delight
              </Link>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Button variant="ghost" size="icon" aria-label="Close menu" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-5">
              <form className="mb-6" role="search" onSubmit={handleSearchSubmit}>
                <label htmlFor="mobile-site-search" className="sr-only">
                  Search snacks
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="mobile-site-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search snacks..."
                    className="h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </form>

              <nav className="grid gap-1">
                {isAuthenticated ? (
                  <Link
                    to={ROUTES.profile}
                    className="rounded-md px-3 py-3 text-base font-semibold hover:bg-muted"
                    onClick={onClose}
                  >
                    My account
                  </Link>
                ) : null}
                <Link
                  to={isAuthenticated ? ROUTES.wishlist : ROUTES.login}
                  className="flex items-center justify-between rounded-md px-3 py-3 text-base font-semibold hover:bg-muted"
                  onClick={onClose}
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Wishlist
                  </span>
                  {wishlistCount > 0 ? (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                      {wishlistCount}
                    </span>
                  ) : null}
                </Link>
                {SITE_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="rounded-md px-3 py-3 text-base font-semibold hover:bg-muted"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-md px-3 py-3 text-left text-base font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                ) : null}
              </nav>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
