import { Helmet } from 'react-helmet-async';

export default function CartPage() {
  return (
    <section className="container py-10">
      <Helmet>
        <title>Your Cart | SnackCo</title>
      </Helmet>
      <h1 className="text-3xl font-bold">Your cart</h1>
    </section>
  );
}
