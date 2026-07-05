import { Helmet } from 'react-helmet-async';

import { ProductCard } from '@/components/customer/ProductCard';
import { ProductGridSkeleton } from '@/components/customer/ProductGridSkeleton';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { products } from '@/constants/homeContent';

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title>Shop Snacks | SnackCo</title>
        <meta
          name="description"
          content="Browse premium snacks, popcorn, chips, trail mixes, best sellers, deals, and combo packs."
        />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Shop snacks' }]} />
      <section className="container py-8">
        <SectionHeader
          eyebrow="All snacks"
          title="Shop the full snack shelf"
          description="Search, filters, sorting, and live inventory will connect to the backend catalog API in the product phase."
        />
        <div className="mb-8 rounded-lg border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <input
              type="search"
              placeholder="Search snacks"
              className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <select className="h-11 rounded-md border bg-background px-3 text-sm">
              <option>All categories</option>
              <option>Popcorn</option>
              <option>Chips</option>
              <option>Trail Mix</option>
            </select>
            <select className="h-11 rounded-md border bg-background px-3 text-sm">
              <option>Featured</option>
              <option>Price: Low to high</option>
              <option>Newest</option>
            </select>
          </div>
        </div>
        <div className="sr-only">
          <ProductGridSkeleton />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
