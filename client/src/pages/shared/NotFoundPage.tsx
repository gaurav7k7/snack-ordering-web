import { ArrowLeft, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page not found | Lotus Delight</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="grid min-h-[70vh] place-items-center px-6 py-16 text-center">
        <section className="max-w-md">
          <p className="bg-gradient-brand bg-clip-text text-7xl font-black text-transparent sm:text-8xl">404</p>
          <h1 className="mt-4 text-2xl font-black sm:text-3xl">This page wandered off the shelf</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The page you're looking for doesn't exist, moved, or the link might be broken. Let's get you back to
            something tasty.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to={ROUTES.home}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={ROUTES.products}>
                <Search className="mr-2 h-4 w-4" /> Browse snacks
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
