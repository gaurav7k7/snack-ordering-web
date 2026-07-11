import { ArrowRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Button } from '@/components/ui/button';
import type { Slide } from '@/types/home';
import { cldUrl } from '@/utils/cloudinaryImage';

import 'swiper/css';
import 'swiper/css/pagination';

type HeroSliderProps = {
  slides: Slide[];
};

export function HeroSlider({ slides }: HeroSliderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={prefersReducedMotion ? false : { delay: 5200, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        className="hero-swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative min-h-[calc(100dvh-7rem)] overflow-hidden">
              <img
                src={cldUrl(slide.image, 'hero')}
                alt=""
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
              <div className="container relative z-10 flex min-h-[calc(100dvh-7rem)] items-center py-16 text-white">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-secondary">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                    {slide.description}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg" variant="gradient">
                      <Link to={slide.href}>
                        {slide.ctaLabel}
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary">
                      <Link to="/products">Browse all snacks</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
