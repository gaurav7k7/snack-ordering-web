import { Helmet } from 'react-helmet-async';

import { AiRecommendationsTeaser } from '@/components/customer/AiRecommendationsTeaser';
import { CategoryTile } from '@/components/customer/CategoryTile';
import { HeroSlider } from '@/components/customer/HeroSlider';
import { Newsletter } from '@/components/customer/Newsletter';
import { ProductShelf } from '@/components/customer/ProductShelf';
import { ReviewCard } from '@/components/customer/ReviewCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import {
  brands,
  categories,
  galleryImages,
  heroSlides,
  products,
  reviews,
} from '@/constants/homeContent';
import { cldUrl } from '@/utils/cloudinaryImage';

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);
  const popularSnacks = products.slice(1, 5);
  const bestSellers = products.filter((product) => ['Best seller', "Today's deal", 'Combo'].includes(product.badge));
  const trendingProducts = products.filter((product) => ['Trending', 'New', 'Seasonal'].includes(product.badge));
  const todaysDeals = products.filter((product) => product.compareAtPrice);
  const newArrivals = products.filter((product) => ['New', 'Seasonal'].includes(product.badge));

  return (
    <>
      <Helmet>
        <title>SnackCo | Premium Snacks Delivered</title>
        <meta
          name="description"
          content="Order premium popcorn, chips, trail mixes, combo snack boxes, seasonal offers, and best sellers from SnackCo."
        />
        <meta property="og:title" content="SnackCo | Premium Snacks Delivered" />
        <meta
          property="og:description"
          content="Modern snack ordering with fresh batches, gift-ready combo boxes, secure checkout, and fast delivery."
        />
      </Helmet>

      <HeroSlider slides={heroSlides} />

      <section className="border-b border-t bg-card py-6">
        <div className="container grid gap-4 text-center sm:grid-cols-3">
          <div>
            <p className="text-2xl font-black">48h</p>
            <p className="text-sm text-muted-foreground">Fresh batch dispatch</p>
          </div>
          <div>
            <p className="text-2xl font-black">25k+</p>
            <p className="text-sm text-muted-foreground">Happy snack orders</p>
          </div>
          <div>
            <p className="text-2xl font-black">4.9</p>
            <p className="text-sm text-muted-foreground">Average customer rating</p>
          </div>
        </div>
      </section>

      <ProductShelf
        eyebrow="Featured products"
        title="Chef-picked snacks for this week"
        description="Premium everyday favorites with polished flavors, giftable packs, and reliable shelf life."
        products={featuredProducts}
      />

      <AiRecommendationsTeaser />

      <section className="bg-muted/50 py-12">
        <div className="container">
          <SectionHeader
            eyebrow="Shop by category"
            title="Find the right crunch faster"
            description="Browse by snack mood, from movie-night popcorn to protein-rich trail mixes."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryTile key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <ProductShelf
        eyebrow="Popular snacks"
        title="Crowd favorites customers reorder"
        description="The flavors people keep adding back to their cart after the first pack disappears."
        products={popularSnacks}
      />

      <section className="bg-foreground py-12 text-background">
        <div className="container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">
              Today's deals
            </p>
            <h2 className="mt-2 text-3xl font-black">Fresh offers before they sell out.</h2>
            <p className="mt-3 text-sm leading-6 text-background/75">
              Limited-time pricing on best sellers, combo packs, and seasonal boxes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {todaysDeals.slice(0, 2).map((product) => (
              <div key={product.id} className="grid grid-cols-[96px_1fr] gap-4 rounded-lg bg-background p-3 text-foreground">
                <img
                  src={cldUrl(product.image, 'thumbnail')}
                  alt={product.name}
                  loading="lazy"
                  className="aspect-square rounded-md object-cover"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{product.badge}</p>
                  <h3 className="mt-1 font-semibold">{product.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Save on a fresh pack today.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductShelf
        eyebrow="Best sellers"
        title="SnackCo icons with loyal fans"
        description="High-rated flavors built for gifting, celebrations, and daily cravings."
        products={bestSellers}
      />

      <ProductShelf
        eyebrow="Trending products"
        title="What everyone is trying now"
        description="New tastes, bold seasoning, and social-worthy boxes moving fast this week."
        products={trendingProducts}
      />

      <section className="bg-muted/50 py-12">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=1200&q=85"
              alt="Combo snack offer with nachos and dips"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <SectionHeader
              eyebrow="Combo offers"
              title="Party boxes without the planning"
              description="Mix spicy, cheesy, sweet, and crunchy packs into ready-to-serve bundles for family nights, office treats, and gifting."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {['Movie Night Box', 'Office Pantry Kit', 'Festive Sweet & Crunch', 'Protein Snack Pack'].map((offer) => (
                <div key={offer} className="rounded-lg border bg-card p-4 font-semibold">
                  {offer}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProductShelf
        eyebrow="Seasonal offers"
        title="Limited runs for festive cravings"
        description="Giftable boxes and special recipes made for the season, available while batches last."
        products={products.filter((product) => ['Seasonal', 'Combo'].includes(product.badge))}
      />

      <ProductShelf
        eyebrow="New arrivals"
        title="Fresh flavors just landed"
        description="Recently launched snacks tested for taste, packaging, and reorder-worthy quality."
        products={newArrivals}
      />

      <section className="bg-card py-12">
        <div className="container">
          <SectionHeader
            eyebrow="Customer reviews"
            title="Loved by snack people"
            description="Real notes from buyers who care about freshness, flavor, delivery, and gifting."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <SectionHeader
            eyebrow="Brands"
            title="Curated labels under one roof"
            description="A focused snack marketplace with quality-first partner brands and house collections."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {brands.map((brand) => (
              <div key={brand} className="grid h-24 place-items-center rounded-lg border bg-card px-4 text-center font-bold">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />

      <section className="py-12">
        <div className="container">
          <SectionHeader
            eyebrow="Instagram gallery"
            title="Fresh from the feed"
            description="A quick look at gift boxes, crunchy bowls, and snack spreads customers love."
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {galleryImages.map((image) => (
              <img
                key={image.id}
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="aspect-square rounded-lg object-cover transition duration-300 hover:scale-[1.02]"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
