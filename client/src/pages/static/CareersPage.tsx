import { Mail } from 'lucide-react';

import { StaticPageLayout } from '@/components/shared/StaticPageLayout';
import { Button } from '@/components/ui/button';

const OPEN_ROLES = [
  { title: 'Warehouse & Fulfillment Associate', location: 'Mumbai, MH', type: 'Full-time' },
  { title: 'Customer Support Specialist', location: 'Remote (India)', type: 'Full-time' },
  { title: 'Growth Marketing Intern', location: 'Mumbai, MH', type: 'Internship' },
];

export default function CareersPage() {
  return (
    <StaticPageLayout
      eyebrow="Join us"
      title="Build the future of snacking with us"
      description="Explore open roles at Lotus Delight — we're a small team building a big snack brand across India."
      breadcrumbLabel="Careers"
    >
      <p>
        We're a small, fast-moving team obsessed with getting great snacks to more people, faster. If you care
        about food, logistics, or building products people actually love, we'd like to hear from you — even if
        nothing below is an exact fit.
      </p>

      <h2>Open roles</h2>
      <div className="space-y-3">
        {OPEN_ROLES.map((role) => (
          <div
            key={role.title}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-4"
          >
            <div>
              <p className="font-semibold text-foreground">{role.title}</p>
              <p className="text-xs text-muted-foreground">
                {role.location} · {role.type}
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <a href="mailto:careers@lotusdelight.co.in?subject=Application">
                <Mail className="mr-2 h-3.5 w-3.5" /> Apply
              </a>
            </Button>
          </div>
        ))}
      </div>

      <h2>Don't see a fit?</h2>
      <p>
        Send us your resume and what you'd want to work on at{' '}
        <a href="mailto:careers@lotusdelight.co.in" className="font-semibold text-foreground hover:text-primary">
          careers@lotusdelight.co.in
        </a>{' '}
        — we read every message.
      </p>
    </StaticPageLayout>
  );
}
