import { Helmet } from 'react-helmet-async';

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>SnackCo | Premium Snacks Delivered</title>
      </Helmet>
      <section className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Freshly packed, joyfully delivered
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Premium snacks for every craving.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Discover curated popcorn, chips, trail mixes, sweets, and festive bundles with a
            checkout experience built for real customers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg">Shop snacks</Button>
            <Button variant="outline" size="lg">
              Explore bundles
            </Button>
          </div>
        </div>
        <div className="aspect-[4/3] rounded-lg border bg-card" />
      </section>
    </>
  );
}
