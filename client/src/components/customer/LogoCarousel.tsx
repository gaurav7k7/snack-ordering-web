import { useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import type { PartnerLogo } from '@/types/partnerLogo';
import { cldUrl } from '@/utils/cloudinaryImage';
import { cn } from '@/utils/cn';

function isExternalLink(href: string) {
  return /^https?:\/\//i.test(href);
}

function LogoItem({ logo }: { logo: PartnerLogo }) {
  const content = (
    <div className="flex h-16 shrink-0 items-center justify-center rounded-lg border bg-card px-6 sm:h-20 sm:px-8">
      <img
        src={cldUrl(logo.logo.url, 'logo')}
        alt={logo.logo.alt || logo.name}
        loading="lazy"
        className="h-full max-h-10 w-auto object-contain sm:max-h-12"
      />
    </div>
  );

  if (!logo.link) {
    return <div aria-label={logo.name}>{content}</div>;
  }

  return isExternalLink(logo.link) ? (
    <a href={logo.link} target="_blank" rel="noreferrer noopener" aria-label={logo.name}>
      {content}
    </a>
  ) : (
    <Link to={logo.link} aria-label={logo.name}>
      {content}
    </Link>
  );
}

type LogoCarouselProps = {
  logos: PartnerLogo[];
};

/**
 * Continuous, infinite-loop "logo cloud" — the list is rendered twice back
 * to back and the whole track slides left by exactly half its width, so the
 * loop point is invisible and the strip never shows a gap. Pauses on hover
 * (desktop) and touch (mobile, so it doesn't fight a manual swipe); reduced-
 * motion users get a single static, wrapped row instead of the doubled,
 * animated track.
 */
export function LogoCarousel({ logos }: LogoCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const lastTouchEndRef = useRef(0);

  if (logos.length === 0) return null;

  if (prefersReducedMotion) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        {logos.map((logo) => (
          <LogoItem key={logo._id} logo={logo} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]',
        '[&::-webkit-scrollbar]:hidden',
      )}
      onMouseEnter={() => {
        // Touch devices fire "ghost" compatibility mouse events (mouseover,
        // mouseenter, click...) right after touchend, purely for legacy
        // hover-only sites. Left unguarded, that ghost mouseenter re-pauses
        // the carousel the instant touchend just resumed it.
        if (Date.now() - lastTouchEndRef.current < 800) return;
        setIsPaused(true);
      }}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        lastTouchEndRef.current = Date.now();
        setIsPaused(false);
      }}
    >
      <div
        className="flex w-max gap-4 animate-logo-scroll sm:gap-6"
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      >
        {[...logos, ...logos].map((logo, index) => (
          <LogoItem key={`${logo._id}-${index}`} logo={logo} />
        ))}
      </div>
    </div>
  );
}
