import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import { ProductCard } from '@/components/customer/ProductCard';
import { ProductGridSkeleton } from '@/components/customer/ProductGridSkeleton';
import { SearchFilters } from '@/components/customer/SearchFilters';
import { SearchPagination } from '@/components/customer/SearchPagination';
import { SearchSuggestions } from '@/components/customer/SearchSuggestions';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearchProductsQuery, useSearchSuggestionsQuery } from '@/redux/api/productsApi';
import type { SearchProduct } from '@/types/product';

const DEFAULT_PAGE_SIZE = 16;

function getUniqueValues(items: SearchProduct[], field: keyof SearchProduct) {
  return Array.from(
    new Set(items.flatMap((item) => (item[field] ? [item[field]] : []))),
  ) as string[];
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');

  const selectedCategory = searchParams.get('category') ?? '';
  const selectedBrand = searchParams.get('brand') ?? '';
  const selectedRating = searchParams.get('rating') ?? '';
  const selectedAvailability = searchParams.get('availability') ?? '';
  const selectedDiscount = searchParams.get('discount') ?? '';
  const selectedSort = searchParams.get('sort') ?? 'newest';
  const page = Number(searchParams.get('page') ?? '1');

  const queryParams = useMemo(
    () => ({
      q: searchParams.get('q') ?? '',
      category: selectedCategory,
      brand: selectedBrand,
      rating: selectedRating,
      availability: selectedAvailability,
      discount: selectedDiscount,
      sort: selectedSort,
      page: String(page),
      limit: String(DEFAULT_PAGE_SIZE),
    }),
    [
      selectedAvailability,
      selectedBrand,
      selectedCategory,
      selectedDiscount,
      selectedRating,
      selectedSort,
      page,
      searchParams,
    ],
  );

  const { data, isFetching } = useSearchProductsQuery(queryParams);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const suggestionsQuery = debouncedSearchQuery.trim();
  const { data: suggestionsData } = useSearchSuggestionsQuery(suggestionsQuery);

  const products = data?.data?.products ?? [];
  const pagination = data?.data?.pagination ?? {
    total: 0,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    totalPages: 1,
  };

  const categories = useMemo(() => getUniqueValues(products, 'category'), [products]);
  const brands = useMemo(() => getUniqueValues(products, 'brand'), [products]);

  const handleParamChange = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1');

    setSearchParams(nextParams);
  };

  const handleSearchSubmit = () => {
    const nextParams = new URLSearchParams(searchParams);

    if (searchQuery.trim()) {
      nextParams.set('q', searchQuery.trim());
    } else {
      nextParams.delete('q');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    ['category', 'brand', 'rating', 'availability', 'discount', 'sort', 'page'].forEach((field) => {
      nextParams.delete(field);
    });
    nextParams.set('sort', 'newest');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  return (
    <>
      <Helmet>
        <title>Shop Snacks | SnackCo</title>
        <meta
          name="description"
          content="Browse premium snacks, popcorn, chips, trail mixes, best sellers, deals, and combo packs. Use powerful search and filters for fast ordering."
        />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Shop snacks' }]} />
      <section className="container py-8">
        <SectionHeader
          eyebrow="All snacks"
          title="Shop the full snack shelf"
          description="Search, filters, sorting, and live inventory are powered by the product catalog API."
        />

        <div className="mb-8 rounded-lg border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <label htmlFor="product-search" className="sr-only">
                Search snacks
              </label>
              <input
                id="product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                placeholder="Search snacks"
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(event) => handleParamChange('category', event.target.value)}
              className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedSort}
              onChange={(event) => handleParamChange('sort', event.target.value)}
              className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="newest">Newest</option>
              <option value="popularity">Popularity</option>
              <option value="price_low_to_high">Price: Low to high</option>
              <option value="price_high_to_low">Price: High to low</option>
              <option value="highest_rated">Highest rated</option>
              <option value="best_selling">Best selling</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <SearchFilters
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              selectedRating={selectedRating}
              selectedAvailability={selectedAvailability}
              selectedDiscount={selectedDiscount}
              selectedSort={selectedSort}
              onCategoryChange={(value) => handleParamChange('category', value)}
              onBrandChange={(value) => handleParamChange('brand', value)}
              onRatingChange={(value) => handleParamChange('rating', value)}
              onAvailabilityChange={(value) => handleParamChange('availability', value)}
              onDiscountChange={(value) => handleParamChange('discount', value)}
              onSortChange={(value) => handleParamChange('sort', value)}
              onResetFilters={handleClearFilters}
            />
            <SearchSuggestions
              query={searchQuery}
              suggestions={suggestionsData?.data?.suggestions ?? []}
              popularSearches={suggestionsData?.data?.popularSearches ?? []}
              onSuggestionClick={(value) => {
                setSearchQuery(value);
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('q', value);
                nextParams.set('page', '1');
                setSearchParams(nextParams);
              }}
            />
          </div>

          <div>
            {isFetching ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductGridSkeleton key={index} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-lg border bg-card p-8 text-center">
                <p className="text-lg font-semibold">No products match your filters.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting category, brand, or sort to see more snacks.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}

            <SearchPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(pageNumber) => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('page', String(pageNumber));
                setSearchParams(nextParams);
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
