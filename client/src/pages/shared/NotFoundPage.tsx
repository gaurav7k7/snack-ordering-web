import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <section>
        <h1 className="text-4xl font-bold">Page not found</h1>
        <Button asChild className="mt-6">
          <Link to="/">Back home</Link>
        </Button>
      </section>
    </main>
  );
}
