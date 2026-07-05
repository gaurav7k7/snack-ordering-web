import { Helmet } from 'react-helmet-async';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default function CartPage() {
  return (
    <>
      <Helmet>
        <title>Your Cart | SnackCo</title>
      </Helmet>
      <Breadcrumbs items={[{ label: 'Cart' }]} />
      <section className="container py-10">
        <h1 className="text-3xl font-bold">Your cart</h1>
        <p className="mt-3 text-muted-foreground">
          Cart and checkout functionality will connect to authenticated order APIs in the commerce phase.
        </p>
      </section>
    </>
  );
}
