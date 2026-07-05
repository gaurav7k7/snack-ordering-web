import { Outlet } from 'react-router-dom';

import { BackToTop } from '@/components/shared/BackToTop';
import { CookieConsent } from '@/components/shared/CookieConsent';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { SiteHeader } from '@/components/shared/SiteHeader';

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <BackToTop />
      <CookieConsent />
    </div>
  );
}
