import { motion, useReducedMotion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import { MobileFilterSheet } from '@/components/customer/MobileFilterSheet';
import { ProductCard } from '@/components/customer/ProductCard';
import { ProductGridSkeleton } from '@/components/customer/ProductGridSkeleton';
import { SearchFilters } from '@/components/customer/SearchFilters';
import { SearchPagination } from '@/components/shared/SearchPagination';
import { SearchSuggestions } from '@/components/customer/SearchSuggestions';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi';
import { useSearchProductsQuery, useSearchSuggestionsQuery } from '@/redux/api/productsApi';
import { useGetBrandsQuery } from '@/redux/api/taxonomyApi';

const DEFAULT_PAGE_SIZE = 16;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const selectedCategory = searchParams.get('category') ?? '';
  const selectedBrand = searchParams.get('brand') ?? '';
  const selectedRating = searchParams.get('rating') ?? '';
  const selectedAvailability = searchParams.get('availability') ?? '';
  const selectedDiscount = searchParams.get('discount') ?? '';
  const selectedSort = searchParams.get('sort') ?? 'newest';
  const page = Number(searchParams.get('page') ?? '1');

  const activeFilterCount = [
    selectedCategory,
    selectedBrand,
    selectedRating,
    selectedAvailability,
    selectedDiscount,
  ].filter(Boolean).length;

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
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

  const products = data?.data?.products ?? [];
  const pagination = data?.data?.pagination ?? {
    total: 0,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    totalPages: 1,
  };

  // Filter option lists come from the real taxonomy endpoints (not the
  // current page of search results) so every real category/brand shows up
  // regardless of what's currently filtered/paginated into view, and so the
  // dropdown value is a real Category id the search API can filter on
  // rather than a name string.
  const categories = useMemo(
    () =>
      (categoriesData?.data?.categories ?? []).map((category) => ({
        id: category._id,
        name: category.name,
      })),
    [categoriesData],
  );
  const brands = useMemo(
    () => (brandsData?.data?.brands ?? []).map((brand) => brand.name),
    [brandsData],
  );

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
                <option key={category.id} value={category.id}>
                  {category.name}
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

          <div className="mt-3 lg:hidden">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setIsFilterSheetOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="hidden space-y-6 lg:block">
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
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <div className="rounded-lg border bg-card p-8 text-center">
                <p className="text-lg font-semibold">No products match your filters.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting category, brand, or sort to see more snacks.
                </p>
              </div>
            ) : (
              <motion.div
                key={`${pagination.page}-${products.length}`}
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.05 } },
                }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.slug}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
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

      <MobileFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        resultCount={pagination.total}
      >
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
      </MobileFilterSheet>
    </>
  );
}
