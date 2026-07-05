import { Helmet } from 'react-helmet-async';

export default function ProductsPage() {
  return (
    <section className="container py-10">
      <Helmet>
        <title>Shop Snacks | SnackCo</title>
      </Helmet>
      <h1 className="text-3xl font-bold">Shop snacks</h1>
    </section>
  );
}
