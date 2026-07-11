import { Wrench } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function MaintenancePage() {
  return (
    <>
      <Helmet>
        <title>Down for maintenance | SnackCo</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <section className="max-w-md">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Wrench className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-black sm:text-3xl">We're sprucing things up</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            SnackCo is undergoing scheduled maintenance right now. We'll be back shortly — thanks for your
            patience.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            Need something urgently? Email{' '}
            <a href="mailto:support@snackco.example" className="font-semibold text-foreground hover:text-primary">
              support@snackco.example
            </a>
          </p>
        </section>
      </main>
    </>
  );
}
