import { Heart, Share2, ShieldCheck, ShoppingBag, Star, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { FloatingAddToCartBar } from '@/components/customer/FloatingAddToCartBar';
import { ProductDetailSkeleton } from '@/components/customer/ProductDetailSkeleton';
import { ProductImageGallery } from '@/components/customer/ProductImageGallery';
import { ProductInfoPanels } from '@/components/customer/ProductInfoPanels';
import { ProductShelf } from '@/components/customer/ProductShelf';
import { QuantitySelector } from '@/components/customer/QuantitySelector';
import { ProductReviewsSection } from '@/components/reviews/ProductReviewsSection';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/hooks/redux';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useWishlist } from '@/hooks/useWishlist';
import { useGetProductBySlugQuery, useSearchProductsQuery } from '@/redux/api/productsApi';
import { addItem } from '@/redux/slices/cartSlice';
import { mapApiProductCardToHomeProduct, mapApiProductToHomeProduct } from '@/utils/mapProduct';
import { cn } from '@/utils/cn';
import { env } from '@/config/env';
import { formatCurrency } from '@/utils/formatCurrency';
import { buildBreadcrumbSchema, buildProductSchema } from '@/utils/structuredData';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isPriceCardVisible, setIsPriceCardVisible] = useState(true);
  const priceCardRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist, isMutating: isWishlistMutating } = useWishlist();

  const { data, isLoading } = useGetProductBySlugQuery(slug ?? '', { skip: !slug });
  const apiProduct = data?.data?.product;
  const product = useMemo(() => (apiProduct ? mapApiProductToHomeProduct(apiProduct) : null), [apiProduct]);

  useEffect(() => {
    const target = priceCardRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => setIsPriceCardVisible(entry.isIntersecting), {
      rootMargin: '-64px 0px 0px 0px',
    });
    observer.observe(target);

    return () => observer.disconnect();
  }, [product]);

  const recentlyViewedIds = useRecentlyViewed(product?.id ?? '');
  const { data: recentlyViewedData } = useSearchProductsQuery(
    { ids: recentlyViewedIds.join(',') },
    { skip: recentlyViewedIds.length === 0 },
  );

  const recommendedProducts = useMemo(
    () => (apiProduct?.recommendedProducts ?? []).map(mapApiProductCardToHomeProduct),
    [apiProduct],
  );

  const relatedProducts = useMemo(
    () => (apiProduct?.relatedProducts ?? []).map(mapApiProductCardToHomeProduct),
    [apiProduct],
  );

  const recentlyViewedProducts = recentlyViewedData?.data?.products ?? [];

  if (!slug) {
    return <Navigate to={ROUTES.products} replace />;
  }

  if (isLoading) {
    return (
      <main>
        <ProductDetailSkeleton />
      </main>
    );
  }

  if (!product) {
    return <Navigate to={ROUTES.products} replace />;
  }

  const isOutOfStock = product.stock === 'out_of_stock' || product.availableQuantity === 0;

  const handleAddToCart = () => {
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.offerPrice,
        quantity,
        slug: product.slug,
        stock: product.availableQuantity,
      }),
    );
    toast.success(`${quantity} x ${product.name} added to cart.`);
  };

  const handleBuyNow = () => {
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.offerPrice,
        quantity,
        slug: product.slug,
        stock: product.availableQuantity,
      }),
    );
    navigate(ROUTES.cart);
  };

  const shareProduct = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: shareUrl,
      });
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Product link copied.');
      return;
    }

    toast('Copy this link from your browser address bar.');
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | SnackCo</title>
        <meta name="description" content={product.description} />
        <link rel="canonical" href={`${env.siteUrl}/products/${product.slug}`} />
        <meta property="og:title" content={`${product.name} | SnackCo`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`${env.siteUrl}/products/${product.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | SnackCo`} />
        <meta name="twitter:description" content={product.description} />
        <meta name="twitter:image" content={product.image} />
        <script type="application/ld+json">{JSON.stringify(buildProductSchema(product))}</script>
        <script type="application/ld+json">
          {JSON.stringify(
            buildBreadcrumbSchema([
              { label: 'Shop snacks', href: '/products' },
              { label: product.category, href: `/products?category=${product.categoryId}` },
              { label: product.name },
            ]),
          )}
        </script>
      </Helmet>

      <Breadcrumbs
        items={[
          { label: 'Shop snacks', href: '/products' },
          { label: product.category, href: `/products?category=${product.category}` },
          { label: product.name },
        ]}
      />

      <section className="container grid gap-10 pb-12 lg:grid-cols-[1fr_0.9fr]">
        <ProductImageGallery images={product.images} productName={product.name} />

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {product.isFeatured ? (
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                Featured
              </span>
            ) : null}
            {product.isTrending ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                Trending
              </span>
            ) : null}
            {product.isBestSeller ? (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                Best seller
              </span>
            ) : null}
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {product.brand} | {product.subCategory}
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{product.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-secondary text-secondary" />
              <span className="font-bold">{product.averageRating}</span>
              <a href="#reviews" className="text-sm text-muted-foreground hover:text-foreground">
                {product.reviewCount} reviews
              </a>
            </div>
            <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
          </div>

          <div ref={priceCardRef} className="mt-6 rounded-lg border bg-card p-5">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-black">{formatCurrency(product.offerPrice)}</span>
              <span className="pb-1 text-lg text-muted-foreground line-through">
                {formatCurrency(product.mrp)}
              </span>
              {product.discount > 0 ? (
                <span className="mb-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                  {product.discount}% off
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">MRP inclusive of all taxes.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <QuantitySelector
                value={quantity}
                max={product.availableQuantity}
                onChange={setQuantity}
              />
              <p className="text-sm font-medium text-muted-foreground">
                {isOutOfStock
                  ? 'Currently out of stock'
                  : `${product.availableQuantity} packs available`}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button size="lg" disabled={isOutOfStock} onClick={handleAddToCart}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to cart
              </Button>
              <Button size="lg" variant="secondary" disabled={isOutOfStock} onClick={handleBuyNow}>
                <Zap className="mr-2 h-4 w-4" />
                Buy now
              </Button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                disabled={isWishlistMutating}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart
                  className={cn('mr-2 h-4 w-4', isWishlisted(product.id) && 'fill-destructive text-destructive')}
                />
                {isWishlisted(product.id) ? 'Wishlisted' : 'Wishlist'}
              </Button>
              <Button type="button" variant="outline" onClick={shareProduct}>
                <Share2 className="mr-2 h-4 w-4" />
                Share product
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border bg-background px-3 py-2 text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex gap-3 rounded-lg border bg-muted/50 p-4">
            <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
            <p className="text-sm leading-6 text-muted-foreground">
              Secure checkout ready, protected packaging, and verified product details for every
              snack pack.
            </p>
          </div>
        </div>
      </section>

      <section className="container space-y-8 pb-12">
        <ProductInfoPanels product={product} />
        <div id="reviews">
          <ProductReviewsSection
            productId={product.id}
            fallbackAverageRating={product.averageRating}
            fallbackReviewCount={product.reviewCount}
          />
        </div>
      </section>

      {recommendedProducts.length > 0 ? (
        <ProductShelf
          eyebrow="Recommended products"
          title="You may also like"
          description="Curated picks that pair well with this snack."
          products={recommendedProducts}
        />
      ) : null}

      {relatedProducts.length > 0 ? (
        <ProductShelf
          eyebrow="Related products"
          title="More from nearby shelves"
          description="Similar flavors, formats, and snack moments."
          products={relatedProducts}
        />
      ) : null}

      {recentlyViewedProducts.length > 0 ? (
        <ProductShelf
          eyebrow="Recently viewed"
          title="Pick up where you left off"
          description="Products viewed in this browser session."
          products={recentlyViewedProducts}
        />
      ) : null}

      <FloatingAddToCartBar
        isVisible={!isPriceCardVisible && !isOutOfStock}
        name={product.name}
        image={product.image}
        price={product.offerPrice}
        disabled={isOutOfStock}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
