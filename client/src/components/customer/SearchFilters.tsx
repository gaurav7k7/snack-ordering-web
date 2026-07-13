import { useMemo } from 'react';

import { Button } from '@/components/ui/button';

type SearchFiltersProps = {
  categories: Array<{ id: string; name: string }>;
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
  selectedRating: string;
  selectedAvailability: string;
  selectedDiscount: string;
  selectedSort: string;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onAvailabilityChange: (value: string) => void;
  onDiscountChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onResetFilters: () => void;
};

const ratingOptions = [
  { value: '', label: 'Any rating' },
  { value: '4', label: '4 stars & up' },
  { value: '4.5', label: '4.5 stars & up' },
  { value: '5', label: '5 stars' },
];

const availabilityOptions = [
  { value: '', label: 'All availability' },
  { value: 'available', label: 'In stock' },
  { value: 'low_stock', label: 'Low stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
];

const discountOptions = [
  { value: '', label: 'Any discount' },
  { value: '10', label: '10%+' },
  { value: '20', label: '20%+' },
  { value: '30', label: '30%+' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_low_to_high', label: 'Price: Low to High' },
  { value: 'price_high_to_low', label: 'Price: High to Low' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'best_selling', label: 'Best Selling' },
];

export function SearchFilters({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedRating,
  selectedAvailability,
  selectedDiscount,
  selectedSort,
  onCategoryChange,
  onBrandChange,
  onRatingChange,
  onAvailabilityChange,
  onDiscountChange,
  onSortChange,
  onResetFilters,
}: SearchFiltersProps) {
  const brandOptions = useMemo(
    () => [
      { value: '', label: 'All brands' },
      ...brands.map((brand) => ({ value: brand, label: brand })),
    ],
    [brands],
  );

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Category</span>
          <select
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="mt-2 block w-full rounded-md border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Brand</span>
          <select
            value={selectedBrand}
            onChange={(event) => onBrandChange(event.target.value)}
            className="mt-2 block w-full rounded-md border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {brandOptions.map((brand) => (
              <option key={brand.value} value={brand.value}>
                {brand.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Sort by</span>
          <select
            value={selectedSort}
            onChange={(event) => onSortChange(event.target.value)}
            className="mt-2 block w-full rounded-md border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Rating</span>
          <select
            value={selectedRating}
            onChange={(event) => onRatingChange(event.target.value)}
            className="mt-2 block w-full rounded-md border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {ratingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Availability</span>
          <select
            value={selectedAvailability}
            onChange={(event) => onAvailabilityChange(event.target.value)}
            className="mt-2 block w-full rounded-md border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-muted-foreground">Discount</span>
          <select
            value={selectedDiscount}
            onChange={(event) => onDiscountChange(event.target.value)}
            className="mt-2 block w-full rounded-md border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {discountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onResetFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
