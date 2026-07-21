import { useGetSiteSettingsQuery } from '@/redux/api/siteSettingsApi';

// Mirrors server/src/models/SiteSettings.model.ts's default — shown until
// the real value loads, so the bar never flashes empty on first paint.
const DEFAULT_ANNOUNCEMENT_TEXT = '🚚 Free Delivery on Orders Above ₹499';

export function AnnouncementBar() {
  const { data } = useGetSiteSettingsQuery();
  const text = data?.data?.settings.announcementText || DEFAULT_ANNOUNCEMENT_TEXT;

  return (
    <div className="relative h-9 overflow-hidden border-b bg-foreground text-background">
      {/* Single text node, positioned absolutely so `transform` is free for
          just the crawl animation (vertical centering comes from the
          full-height flex box, not a second transform). Reduced-motion users
          get the plain static, centered bar instead of the animation. */}
      <div className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap px-6 text-xs font-medium motion-safe:animate-ticker motion-safe:hover:[animation-play-state:paused] motion-reduce:static motion-reduce:w-full motion-reduce:justify-center">
        {text}
      </div>
    </div>
  );
}
