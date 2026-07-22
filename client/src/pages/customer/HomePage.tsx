import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

import { CategoryTile } from '@/components/customer/CategoryTile';
import { HeroSlider } from '@/components/customer/HeroSlider';
import { LogoCarousel } from '@/components/customer/LogoCarousel';
import { Newsletter } from '@/components/customer/Newsletter';
import { ProductShelf } from '@/components/customer/ProductShelf';
import { ReviewCard } from '@/components/customer/ReviewCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { env } from '@/config/env';
import { galleryImages, reviews } from '@/constants/homeContent';
import { useGetCategoriesQuery } from '@/redux/api/categoriesApi';
import { useGetPartnerLogosQuery } from '@/redux/api/partnerLogosApi';
import { useSearchProductsQuery } from '@/redux/api/productsApi';
import { useGetSiteSettingsQuery } from '@/redux/api/siteSettingsApi';
import { useGetBrandsQuery } from '@/redux/api/taxonomyApi';
import { cldUrl } from '@/utils/cloudinaryImage';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('auth') === 'google-success') {
      toast.success('Signed in with Google!');
      setSearchParams((params) => {
        params.delete('auth');
        return params;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: featuredData } = useSearchProductsQuery({ featured: 'true', limit: '4' });
  const { data: popularData } = useSearchProductsQuery({ sort: 'popularity', limit: '4' });
  const { data: dealsData } = useSearchProductsQuery({ discount: '15', limit: '4' });
  const { data: bestSellersData } = useSearchProductsQuery({ bestSeller: 'true', limit: '4' });
  const { data: trendingData } = useSearchProductsQuery({ trending: 'true', limit: '4' });
  const { data: newArrivalsData } = useSearchProductsQuery({ sort: 'newest', limit: '4' });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: b2bClientsData } = useGetPartnerLogosQuery({ category: 'b2b_client' });
  const { data: mediaCoverageData } = useGetPartnerLogosQuery({ category: 'media_coverage' });
  const { data: siteSettingsData } = useGetSiteSettingsQuery();

  const featuredProducts = featuredData?.data?.products ?? [];
  const popularSnacks = popularData?.data?.products ?? [];
  const todaysDeals = dealsData?.data?.products ?? [];
  const bestSellers = bestSellersData?.data?.products ?? [];
  const trendingProducts = trendingData?.data?.products ?? [];
  const newArrivals = newArrivalsData?.data?.products ?? [];
  const categories = categoriesData?.data?.categories ?? [];
  const brands = brandsData?.data?.brands ?? [];
  const b2bClients = b2bClientsData?.data?.logos ?? [];
  const mediaCoverage = mediaCoverageData?.data?.logos ?? [];
  const siteSettings = siteSettingsData?.data?.settings;

  return (
    <>
      <Helmet>
        <title>Lotus Delight | Premium Makhana (Fox Nuts) & Healthy Snacks Online</title>
        <meta
          name="description"
          content="Shop Lotus Delight's premium roasted makhana in multiple flavours, plus popcorn, chips, trail mixes, combo boxes, and best sellers — healthy snacking delivered across India."
        />
        <meta name="keywords" content="makhana, fox nuts, roasted makhana, healthy snacks, flavoured makhana online" />
        <link rel="canonical" href={env.siteUrl} />
        <meta property="og:title" content="Lotus Delight | Premium Makhana (Fox Nuts) & Healthy Snacks Online" />
        <meta
          property="og:description"
          content="Premium roasted makhana in multiple flavours, plus popcorn, chips, and trail mixes — healthy snacking, delivered across India."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={env.siteUrl} />
        <meta property="og:image" content={`${env.siteUrl}/icon-512.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lotus Delight | Premium Makhana (Fox Nuts) & Healthy Snacks Online" />
        <meta
          name="twitter:description"
          content="Premium roasted makhana in multiple flavours, plus popcorn, chips, and trail mixes — healthy snacking, delivered across India."
        />
      </Helmet>

      <HeroSlider />

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

      {featuredProducts.length > 0 ? (
        <ProductShelf
          eyebrow="Featured products"
          title="Chef-picked snacks for this week"
          description="Premium everyday favorites with polished flavors, giftable packs, and reliable shelf life."
          products={featuredProducts}
        />
      ) : null}

      {categories.length > 0 ? (
        <section className="bg-muted/50 py-12">
          <div className="container">
            <SectionHeader
              eyebrow="Shop by category"
              title="Find the right crunch faster"
              description="Browse by snack mood, from movie-night popcorn to protein-rich trail mixes."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <CategoryTile
                  key={category._id}
                  category={{ id: category._id, name: category.name, image: category.image?.url }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {popularSnacks.length > 0 ? (
        <ProductShelf
          eyebrow="Popular snacks"
          title="Crowd favorites customers reorder"
          description="The flavors people keep adding back to their cart after the first pack disappears."
          products={popularSnacks}
        />
      ) : null}

      {todaysDeals.length > 0 ? (
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
                <a
                  key={product._id}
                  href={`/products/${product.slug}`}
                  className="grid grid-cols-[96px_1fr] gap-4 rounded-lg bg-background p-3 text-foreground"
                >
                  <img
                    src={cldUrl(product.images?.[0]?.url, 'thumbnail')}
                    alt={product.name}
                    loading="lazy"
                    className="aspect-square rounded-md object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      {product.discount}% off
                    </p>
                    <h3 className="mt-1 font-semibold">{product.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Save on a fresh pack today.</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {bestSellers.length > 0 ? (
        <ProductShelf
          eyebrow="Best sellers"
          title="Lotus Delight icons with loyal fans"
          description="High-rated flavors built for gifting, celebrations, and daily cravings."
          products={bestSellers}
        />
      ) : null}

      {trendingProducts.length > 0 ? (
        <ProductShelf
          eyebrow="Trending products"
          title="What everyone is trying now"
          description="New tastes, bold seasoning, and social-worthy boxes moving fast this week."
          products={trendingProducts}
        />
      ) : null}

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

      {newArrivals.length > 0 ? (
        <ProductShelf
          eyebrow="New arrivals"
          title="Fresh flavors just landed"
          description="Recently launched snacks tested for taste, packaging, and reorder-worthy quality."
          products={newArrivals}
        />
      ) : null}

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

      {brands.length > 0 ? (
        <section className="py-12">
          <div className="container">
            <SectionHeader
              eyebrow="Brands"
              title="Curated labels under one roof"
              description="A focused snack marketplace with quality-first partner brands and house collections."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {brands.slice(0, 10).map((brand) => (
                <div
                  key={brand._id}
                  className="grid h-24 place-items-center rounded-lg border bg-card px-4 text-center font-bold"
                >
                  {brand.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

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

      {b2bClients.length > 0 ? (
        <section className="border-t bg-muted/30 py-12">
          <div className="container">
            <SectionHeader title={siteSettings?.b2bClientsHeading || 'Our B2B Clients'} />
            <LogoCarousel logos={b2bClients} />
          </div>
        </section>
      ) : null}

      {mediaCoverage.length > 0 ? (
        <section className="border-t py-12">
          <div className="container">
            <SectionHeader title={siteSettings?.mediaCoverageHeading || 'Media Coverage'} />
            <LogoCarousel logos={mediaCoverage} />
          </div>
        </section>
      ) : null}
    </>
  );
}
