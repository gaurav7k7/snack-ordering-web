import { Newspaper } from 'lucide-react';

import { StaticPageLayout } from '@/components/shared/StaticPageLayout';
import { Button } from '@/components/ui/button';

export default function BlogPage() {
  return (
    <StaticPageLayout
      eyebrow="Journal"
      title="The Lotus Delight Blog"
      description="Recipes, snack culture, and behind-the-scenes stories from Lotus Delight — coming soon."
      breadcrumbLabel="Blog"
    >
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border/70 bg-card/50 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Newspaper className="h-7 w-7" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">We're writing our first posts</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Recipes, regional snack spotlights, and stories from the producers we work with — the Lotus Delight Journal
            launches soon.
          </p>
        </div>
        <Button asChild>
          <a href="/#newsletter">Get notified at launch</a>
        </Button>
      </div>
    </StaticPageLayout>
  );
}
