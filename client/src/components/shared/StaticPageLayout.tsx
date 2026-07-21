import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { env } from '@/config/env';

type StaticPageLayoutProps = {
  title: string;
  description: string;
  breadcrumbLabel: string;
  eyebrow?: string;
  children: ReactNode;
};

export function StaticPageLayout({ title, description, breadcrumbLabel, eyebrow, children }: StaticPageLayoutProps) {
  const { pathname } = useLocation();
  const canonicalUrl = `${env.siteUrl}${pathname}`;

  return (
    <>
      <Helmet>
        <title>{`${title} | Lotus Delight`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${title} | Lotus Delight`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${title} | Lotus Delight`} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      <Breadcrumbs items={[{ label: breadcrumbLabel }]} />

      <section className="container max-w-3xl pb-16 pt-2">
        {eyebrow ? (
          <p className="bg-gradient-brand bg-clip-text text-xs font-bold uppercase tracking-[0.22em] text-transparent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-2 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </section>
    </>
  );
}
