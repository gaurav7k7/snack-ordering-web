import { Outlet } from 'react-router-dom';

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
    </div>
  );
}
