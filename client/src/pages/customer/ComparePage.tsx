import { ShoppingBag, Star, Trash2, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/hooks/redux';
import { useCompare } from '@/hooks/useCompare';
import { useSearchProductsQuery } from '@/redux/api/productsApi';
import { addItem } from '@/redux/slices/cartSlice';
import type { SearchProduct } from '@/types/product';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatCurrency } from '@/utils/formatCurrency';

function getProductId(product: SearchProduct) {
  return product.id ?? product._id ?? '';
}

const SPEC_ROWS: Array<{
  label: string;
  render: (product: SearchProduct) => React.ReactNode;
}> = [
  { label: 'Price', render: (p) => <span className="font-bold">{formatCurrency(p.offerPrice ?? p.price ?? 0)}</span> },
  {
    label: 'MRP',
    render: (p) =>
      p.compareAtPrice ? <span className="text-muted-foreground line-through">{formatCurrency(p.compareAtPrice)}</span> : '—',
  },
  { label: 'Brand', render: (p) => p.brand || '—' },
  { label: 'Category', render: (p) => p.category || '—' },
  { label: 'Sub-category', render: (p) => p.subCategory || '—' },
  {
    label: 'Rating',
    render: (p) => (
      <span className="inline-flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
        {(p.averageRating ?? p.rating ?? 0).toFixed(1)} ({p.reviewCount ?? p.reviews ?? 0})
      </span>
    ),
  },
  {
    label: 'Availability',
    render: (p) =>
      p.stock === 'out_of_stock' ? (
        <span className="font-semibold text-destructive">Out of stock</span>
      ) : p.stock === 'low_stock' ? (
        <span className="font-semibold text-amber-600">Low stock</span>
      ) : (
        <span className="font-semibold text-emerald-600">In stock</span>
      ),
  },
  { label: 'Tags', render: (p) => (p.tags?.length ? p.tags.join(', ') : '—') },
];

export default function ComparePage() {
  const { productIds, remove, clear } = useCompare();
  const dispatch = useAppDispatch();

  const { data, isLoading } = useSearchProductsQuery(
    { ids: productIds.join(',') },
    { skip: productIds.length === 0 },
  );
  const products = data?.data?.products ?? [];

  return (
    <>
      <Helmet>
        <title>Compare Products | SnackCo</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Compare products' }]} />

      <section className="container pb-16 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">Compare products</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Side-by-side specs for up to 4 products at a time.
            </p>
          </div>
          {products.length > 0 && (
            <Button variant="outline" onClick={clear}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear all
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading comparison…</p>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed p-10 text-center">
            <p className="text-lg font-semibold">Nothing to compare yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the compare icon on any product card to add it here — up to 4 at a time.
            </p>
            <Button asChild className="mt-6">
              <Link to={ROUTES.products}>Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="w-40 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Product
                  </th>
                  {products.map((product) => (
                    <th key={getProductId(product)} className="px-4 py-4 text-left">
                      <div className="relative w-40">
                        <button
                          type="button"
                          onClick={() => remove(getProductId(product))}
                          aria-label={`Remove ${product.name}`}
                          className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-background text-muted-foreground shadow hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <Link to={`/products/${product.slug}`} className="block">
                          <img
                            src={cldUrl(product.image ?? product.images?.[0]?.url, 'card')}
                            alt={product.name}
                            className="aspect-square w-full rounded-xl object-cover"
                          />
                          <p className="mt-2 line-clamp-2 text-sm font-semibold hover:text-primary">{product.name}</p>
                        </Link>
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() =>
                            dispatch(
                              addItem({
                                productId: getProductId(product),
                                name: product.name,
                                image: product.image ?? product.images?.[0]?.url ?? '',
                                price: product.offerPrice ?? product.price ?? 0,
                                quantity: 1,
                                slug: product.slug,
                                stock: product.availableQuantity ?? 0,
                              }),
                            )
                          }
                        >
                          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Add to cart
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPEC_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3 font-semibold text-foreground">{row.label}</td>
                    {products.map((product) => (
                      <td key={getProductId(product)} className="px-4 py-3 text-muted-foreground">
                        {row.render(product)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
