import { Award, Leaf, Truck, Users } from 'lucide-react';

import { StaticPageLayout } from '@/components/shared/StaticPageLayout';

const VALUES = [
  {
    icon: Leaf,
    title: 'Honest ingredients',
    description: 'No artificial preservatives in our house-made batches — just real spices, real oil, real flavor.',
  },
  {
    icon: Award,
    title: 'Small-batch quality',
    description: 'Every batch is quality-checked before it ships, so what you taste is always fresh.',
  },
  {
    icon: Truck,
    title: 'Fast, careful delivery',
    description: 'Sealed packaging and quick dispatch mean your snacks arrive crisp, not crushed.',
  },
  {
    icon: Users,
    title: 'Built with our community',
    description: 'Flavors and combos are shaped by customer feedback, not boardroom guesswork.',
  },
];

export default function AboutPage() {
  return (
    <StaticPageLayout
      eyebrow="Our story"
      title="Snacking, taken seriously"
      description="Learn about Lotus Delight — an India-first snack brand built on honest ingredients, small-batch quality, and fast delivery."
      breadcrumbLabel="About us"
    >
      <p>
        Lotus Delight started with a simple frustration: great regional snacks were either impossible to find outside
        their home city, or arrived stale after sitting in a warehouse for months. We set out to fix that — sourcing
        directly from small manufacturers and home kitchens across India, and getting each batch to your door while
        it's still fresh.
      </p>
      <p>
        Today we work with over a dozen producers spanning chips, namkeen, trail mixes, and roasted snacks, all
        held to the same standard: real ingredients, transparent nutrition labeling, and packaging that keeps things
        crisp in transit.
      </p>

      <h2>What we stand for</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <value.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">{value.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>

      <h2>Where we're headed</h2>
      <p>
        We're growing the list of producers we partner with every quarter, expanding delivery coverage across more
        pin codes, and building tools — like nutrition transparency and verified reviews — that help you actually
        trust what you're eating. Thanks for snacking with us.
      </p>
    </StaticPageLayout>
  );
}
