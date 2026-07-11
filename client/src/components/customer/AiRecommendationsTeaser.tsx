import { Sparkles } from 'lucide-react';

export function AiRecommendationsTeaser() {
  return (
    <section className="container py-8">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-primary/30 bg-gradient-brand-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">AI recommendations — coming soon</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              We're training a personalized picks engine on your browsing and order history. Soon this
              spot will show snacks curated just for you, not just what's trending site-wide.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
