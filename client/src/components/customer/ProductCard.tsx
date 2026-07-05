import { Heart, ShoppingBag, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { HomeProduct } from '@/types/home';
import { formatCurrency } from '@/utils/formatCurrency';

type ProductCardProps = {
  product: HomeProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border bg-card text-card-foreground transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {product.badge}
        </span>
        <Button
          size="icon"
          variant="secondary"
          className="absolute right-3 top-3 rounded-full"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-12 text-base font-semibold">{product.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-secondary text-secondary" aria-hidden="true" />
          <span className="font-semibold">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
            {product.compareAtPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
          <Button size="icon" aria-label={`Add ${product.name} to cart`}>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
