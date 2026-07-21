import { useReducedMotion } from 'framer-motion';
import { ArrowRight, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useGetBannersQuery } from '@/redux/api/bannersApi';
import type { Banner } from '@/types/banner';
import { optimizeImageUrl } from '@/utils/cloudinaryImage';

import 'swiper/css';
import 'swiper/css/pagination';

function isExternalLink(href: string) {
  return /^https?:\/\//i.test(href);
}

function BannerSlideImage({ banner, index }: { banner: Banner; index: number }) {
  if (!banner.image?.url) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/60">
        <ImageOff className="h-10 w-10 text-white/60" aria-hidden="true" />
      </div>
    );
  }

  const src = optimizeImageUrl(banner.image.url, { width: 1920, crop: 'scale' });
  const srcSet = [640, 1024, 1600, 1920]
    .map((width) => `${optimizeImageUrl(banner.image!.url, { width, crop: 'scale' })} ${width}w`)
    .join(', ');

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes="100vw"
      alt={banner.image.alt || banner.heading}
      fetchPriority={index === 0 ? 'high' : 'auto'}
      loading={index === 0 ? 'eager' : 'lazy'}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export function HeroSlider() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading } = useGetBannersQuery();
  const banners = [...(data?.data?.banners ?? [])].sort((a, b) => a.order - b.order);
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return <div className="min-h-[calc(100dvh-7rem)] w-full animate-pulse bg-muted" />;
  }

  if (banners.length === 0) {
    // No active banners configured — still render a branded panel (rather
    // than nothing) so the homepage always has exactly one <h1> for SEO and
    // never shows a jarring blank gap where the hero used to be.
    return (
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/60 text-white">
        <div className="container relative z-10 max-w-2xl text-center">
          <h1 className="text-4xl font-black leading-tight sm:text-6xl">Premium Makhana, Delivered Fresh</h1>
          <p className="mt-5 text-base leading-7 text-white/85 sm:text-lg">
            Roasted makhana in multiple flavours, plus popcorn, chips, and trail mixes — healthy snacking delivered
            across India.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="gradient">
              <Link to={ROUTES.products}>
                Shop now
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      {/* Swiper keeps every slide mounted (for smooth transitions), which would
          otherwise put one <h1> per banner in the DOM at once. A single
          screen-reader-only <h1> tracking the active slide keeps exactly one
          real heading for SEO/accessibility, while each slide's visible
          heading below renders as a <p> styled identically. */}
      <h1 className="sr-only">{banners[activeIndex]?.heading}</h1>
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={prefersReducedMotion || banners.length < 2 ? false : { delay: 5200, disableOnInteraction: false }}
        loop={banners.length > 1}
        pagination={banners.length > 1 ? { clickable: true } : false}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="hero-swiper"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner._id}>
            <div className="relative min-h-[calc(100dvh-7rem)] overflow-hidden">
              <BannerSlideImage banner={banner} index={index} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
              <div className="container relative z-10 flex min-h-[calc(100dvh-7rem)] items-center py-16 text-white">
                <div className="max-w-3xl">
                  {banner.subheading ? (
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                      {banner.subheading}
                    </p>
                  ) : null}
                  <p className="mt-4 text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
                    {banner.heading}
                  </p>
                  {banner.description ? (
                    <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                      {banner.description}
                    </p>
                  ) : null}
                  {banner.buttonText && banner.buttonLink ? (
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button asChild size="lg" variant="gradient">
                        {isExternalLink(banner.buttonLink) ? (
                          <a href={banner.buttonLink} target="_blank" rel="noreferrer noopener">
                            {banner.buttonText}
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                          </a>
                        ) : (
                          <Link to={banner.buttonLink}>
                            {banner.buttonText}
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                          </Link>
                        )}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
