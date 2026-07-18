import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageLoader } from '@/components/shared/PageLoader';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/hooks/redux';
import { useWishlist } from '@/hooks/useWishlist';
import { addItem } from '@/redux/slices/cartSlice';
import type { ApiProductCard } from '@/types/product';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatCurrency } from '@/utils/formatCurrency';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();

  const handleMoveToCart = async (product: ApiProductCard) => {
    dispatch(
      addItem({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url ?? '',
        price: product.offerPrice,
        quantity: 1,
        slug: product.slug,
        stock: product.availableQuantity,
      }),
    );

    try {
      await removeFromWishlist(product._id).unwrap();
      toast.success(`${product.name} moved to your cart.`);
    } catch {
      toast.success(`${product.name} added to cart.`);
    }
  };

  const handleRemove = async (product: ApiProductCard) => {
    try {
      await removeFromWishlist(product._id).unwrap();
      toast.success('Removed from wishlist.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to remove item.'));
    }
  };

  return (
    <>
      <Helmet>
        <title>Your Wishlist | Lotus Delight</title>
        <meta name="description" content="Snacks you've saved for later — pick up where you left off." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Breadcrumbs items={[{ label: 'Wishlist' }]} />
      <section className="container py-10">
        <div>
          <h1 className="text-3xl font-black">Your wishlist</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Snacks you've saved for later. Move them to your cart whenever you're ready.
          </p>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : wishlist.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={Heart}
            title="Your wishlist is empty."
            description="Tap the heart icon on any snack to save it here."
            action={{ label: 'Browse snacks', to: ROUTES.products }}
          />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((product) => {
              const isOutOfStock = (product.availableQuantity ?? 0) <= 0;

              return (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-lg border bg-card text-card-foreground"
                >
                  <Link to={`/products/${product.slug}`} className="block aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={cldUrl(product.images?.[0]?.url, 'card')}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="space-y-3 p-4">
                    <h3 className="line-clamp-2 min-h-12 text-base font-semibold">
                      <Link to={`/products/${product.slug}`} className="hover:text-primary">
                        {product.name}
                      </Link>
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">{formatCurrency(product.offerPrice)}</span>
                      {product.discount > 0 ? (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.mrp)}
                        </span>
                      ) : null}
                    </div>
                    {isOutOfStock && (
                      <p className="text-xs font-semibold text-destructive">Out of stock</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isOutOfStock}
                        onClick={() => handleMoveToCart(product)}
                      >
                        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Move to cart
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemove(product)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
