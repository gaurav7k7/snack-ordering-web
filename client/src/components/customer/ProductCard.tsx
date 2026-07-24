import { GitCompareArrows, Heart, ImageOff, ShoppingBag, Star } from 'lucide-react';
import { memo, type MouseEvent, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/hooks/redux';
import { useCompare } from '@/hooks/useCompare';
import { useWishlist } from '@/hooks/useWishlist';
import { addItem } from '@/redux/slices/cartSlice';
import type { HomeProduct } from '@/types/home';
import type { SearchProduct } from '@/types/product';
import { cldUrl } from '@/utils/cloudinaryImage';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatCurrency';

type ProductCardProps = {
  product: HomeProduct | SearchProduct;
};

function getProductId(product: HomeProduct | SearchProduct) {
  return product.id ?? (product as SearchProduct)._id ?? '';
}

function getProductImage(product: HomeProduct | SearchProduct) {
  return product.image || product.images?.[0]?.url || product.images?.[0]?.url || '';
}

function getProductPrice(product: HomeProduct | SearchProduct) {
  return product.price ?? product.offerPrice ?? product.compareAtPrice ?? 0;
}

function getCompareAtPrice(product: HomeProduct | SearchProduct) {
  return (
    product.compareAtPrice ??
    product.mrp ??
    (product.price !== undefined && product.offerPrice ? product.price : undefined)
  );
}

function getProductRating(product: HomeProduct | SearchProduct) {
  return product.rating ?? product.averageRating ?? 0;
}

function getProductReviews(product: HomeProduct | SearchProduct) {
  if (typeof product.reviews === 'number') return product.reviews;
  return product.reviewCount ?? 0;
}

function getBadge(product: HomeProduct | SearchProduct) {
  return (
    product.badge ||
    (product.isTrending ? 'Trending' : undefined) ||
    (product.isFeatured ? 'Featured' : undefined) ||
    ''
  );
}

function getWeight(product: HomeProduct | SearchProduct) {
  return product.weight || '';
}

/** Rounds down like a real storefront discount — never overstate the % off. */
function getDiscountPercent(price: number, compareAtPrice: number | undefined) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.floor(((compareAtPrice - price) / compareAtPrice) * 100);
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const productId = getProductId(product);
  const imageUrl = getProductImage(product);
  const price = getProductPrice(product);
  const compareAtPrice = getCompareAtPrice(product);
  const rating = getProductRating(product);
  const reviews = getProductReviews(product);
  const badge = getBadge(product);
  const weight = getWeight(product);
  const discountPercent = getDiscountPercent(price, compareAtPrice);
  const dispatch = useAppDispatch();
  const { isWishlisted, toggleWishlist, isMutating } = useWishlist();
  const wishlisted = isWishlisted(productId);
  const { isComparing, toggle: toggleCompareProduct } = useCompare();
  const comparing = isComparing(productId);
  const isOutOfStock = (product.availableQuantity ?? 0) <= 0;
  const [imageFailed, setImageFailed] = useState(false);

  const handleAddToCart = (event: MouseEvent) => {
    event.preventDefault();
    dispatch(
      addItem({
        productId,
        name: product.name,
        image: imageUrl,
        price,
        quantity: 1,
        slug: product.slug,
        stock: product.availableQuantity ?? 0,
      }),
    );
    toast.success(`${product.name} added to cart.`);
  };

  return (
    <article className="group overflow-hidden rounded-lg border bg-card text-card-foreground transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link to={`/products/${product.slug}`} className="block h-full">
          {imageFailed || !imageUrl ? (
            <div className="grid h-full w-full place-items-center text-muted-foreground">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
            </div>
          ) : (
            <img
              src={cldUrl(imageUrl, 'productCard')}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          )}
        </Link>
        {badge ? (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {badge}
            </span>
          </div>
        ) : null}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="rounded-full"
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            disabled={isMutating}
            onClick={(event) => {
              event.preventDefault();
              toggleWishlist(productId);
            }}
          >
            <Heart
              className={cn('h-4 w-4', wishlisted && 'fill-destructive text-destructive')}
              aria-hidden="true"
            />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className={cn('rounded-full', comparing && 'bg-primary text-primary-foreground hover:bg-primary/90')}
            aria-label={comparing ? `Remove ${product.name} from compare` : `Add ${product.name} to compare`}
            onClick={(event) => {
              event.preventDefault();
              toggleCompareProduct(productId);
            }}
          >
            <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="space-y-2.5 p-3.5">
        <div>
          <h3 className="line-clamp-2 min-h-11 text-sm font-semibold sm:text-base">
            <Link to={`/products/${product.slug}`} className="hover:text-primary">
              {product.name}
            </Link>
          </h3>
          {weight ? <p className="mt-0.5 text-xs font-medium text-muted-foreground">{weight}</p> : null}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-secondary text-secondary" aria-hidden="true" />
          <span className="font-semibold">{rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({reviews})</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-base font-bold sm:text-lg">{formatCurrency(price)}</span>
            {compareAtPrice && compareAtPrice > price ? (
              <span className="text-xs text-muted-foreground line-through sm:text-sm">
                {formatCurrency(compareAtPrice)}
              </span>
            ) : null}
            {discountPercent > 0 ? (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                {discountPercent}% OFF
              </span>
            ) : null}
          </div>
          <Button
            type="button"
            size="icon"
            className="shrink-0"
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
});
