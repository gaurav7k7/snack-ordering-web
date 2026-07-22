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
      <div className="grid min-h-[320px] place-items-center bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/60 sm:min-h-[420px]">
        <ImageOff className="h-10 w-10 text-white/60" aria-hidden="true" />
      </div>
    );
  }

  // `scale` only constrains width, so Cloudinary never crops. The image is
  // rendered at its own natural width/height ratio (full width, auto
  // height) instead of being forced into a fixed viewport-height box — that
  // way the banner always fills the screen edge to edge with zero cropping
  // and zero empty side margins, whatever aspect ratio it was uploaded at.
  const src = optimizeImageUrl(banner.image.url, { width: 1920, crop: 'scale' });
  const srcSet = [640, 1024, 1600, 1920, 2560]
    .map((width) => `${optimizeImageUrl(banner.image!.url, { width, crop: 'scale' })} ${width}w`)
    .join(', ');

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes="100vw"
      alt={banner.image.alt || banner.heading || 'Lotus Delight banner'}
      fetchPriority={index === 0 ? 'high' : 'auto'}
      loading={index === 0 ? 'eager' : 'lazy'}
      className="block w-full"
    />
  );
}

export function HeroSlider() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading } = useGetBannersQuery();
  const banners = [...(data?.data?.banners ?? [])].sort((a, b) => a.order - b.order);
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return <div className="aspect-[16/6] max-h-[70vh] w-full animate-pulse bg-muted" />;
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
      <h1 className="sr-only">{banners[activeIndex]?.heading || 'Lotus Delight'}</h1>
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={prefersReducedMotion || banners.length < 2 ? false : { delay: 5200, disableOnInteraction: false }}
        loop={banners.length > 1}
        pagination={banners.length > 1 ? { clickable: true } : false}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        // The slide height now comes from each banner's own image (full
        // width, natural aspect ratio) instead of a fixed viewport-height
        // box, so different banners can render at different heights —
        // autoHeight resizes the Swiper container to match the active
        // slide smoothly instead of clipping/stretching it.
        autoHeight
        className="hero-swiper"
      >
        {banners.map((banner, index) => {
          const hasButton = Boolean(banner.buttonText && banner.buttonLink);
          const hasText = Boolean(banner.heading || banner.subheading || banner.description || hasButton);

          return (
            <SwiperSlide key={banner._id}>
              <div className="relative overflow-hidden">
                <BannerSlideImage banner={banner} index={index} />
                {/* Only dim the image when there's text to keep readable —
                    an image-only banner stays at full, undimmed vibrancy. A
                    light bottom-anchored gradient (not a flat overlay across
                    the whole image) keeps the photo's real brightness and
                    colors while still giving the text/button enough contrast. */}
                {hasText ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                ) : null}
                {hasText ? (
                  <div className="container absolute inset-0 z-10 flex flex-col justify-end pb-12 pt-16 text-white sm:pb-16">
                    <div className="max-w-3xl">
                      {banner.subheading ? (
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                          {banner.subheading}
                        </p>
                      ) : null}
                      {banner.heading ? (
                        <p className="mt-4 text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
                          {banner.heading}
                        </p>
                      ) : null}
                      {banner.description ? (
                        <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                          {banner.description}
                        </p>
                      ) : null}
                      {hasButton ? (
                        <div className="mt-8 flex flex-wrap gap-3">
                          <Button asChild size="lg" variant="gradient">
                            {isExternalLink(banner.buttonLink!) ? (
                              <a href={banner.buttonLink} target="_blank" rel="noreferrer noopener">
                                {banner.buttonText}
                                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                              </a>
                            ) : (
                              <Link to={banner.buttonLink!}>
                                {banner.buttonText}
                                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                              </Link>
                            )}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
