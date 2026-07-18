import { CheckCircle2, FileText, Mail } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order?.orderNumber) {
    return (
      <main className="container py-16">
        <Helmet>
          <title>Order confirmation | Lotus Delight</title>
        </Helmet>
        <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-3xl font-black">We couldn't find that confirmation</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This page only shows details right after checkout. If you already placed an order, check
            your inbox for the confirmation email or view your order history below.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link to={ROUTES.products}>
                <FileText className="mr-2 h-4 w-4" /> Continue shopping
              </Link>
            </Button>
            <Button asChild>
              <Link to={ROUTES.orders}>
                <Mail className="mr-2 h-4 w-4" /> View orders
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-16">
      <Helmet>
        <title>Order confirmed | Lotus Delight</title>
      </Helmet>
      <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-3xl font-black">Order confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your snack order has been placed successfully. A confirmation email is on the way.
        </p>

        <div className="mt-8 rounded-2xl border bg-background p-5 text-left">
          <p className="text-sm text-muted-foreground">Order number</p>
          <p className="mt-1 text-xl font-semibold">{order.orderNumber}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            We will send an invoice and delivery update to your inbox shortly.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link to={ROUTES.products}>
              <FileText className="mr-2 h-4 w-4" /> Continue shopping
            </Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.orders}>
              <Mail className="mr-2 h-4 w-4" /> View orders
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
