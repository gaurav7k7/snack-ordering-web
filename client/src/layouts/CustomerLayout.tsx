import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

import { CompareBar } from '@/components/customer/CompareBar';
import { LiveChatWidget } from '@/components/customer/LiveChatWidget';
import { BackToTop } from '@/components/shared/BackToTop';
import { CookieConsent } from '@/components/shared/CookieConsent';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { buildOrganizationSchema, buildWebsiteSchema } from '@/utils/structuredData';

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(buildOrganizationSchema())}</script>
        <script type="application/ld+json">{JSON.stringify(buildWebsiteSchema())}</script>
      </Helmet>
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <CompareBar />
      <LiveChatWidget />
      <BackToTop />
      <CookieConsent />
    </div>
  );
}
