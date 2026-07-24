import { cn } from '@/utils/cn';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Defaults to h2 — pass 'h1' when this is the page's primary heading (e.g. a listing page with no other h1). */
  level?: 'h1' | 'h2';
  /** Defaults to 'left'. Use 'center' for standalone/branding sections (e.g. logo carousels). */
  align?: 'left' | 'center';
};

export function SectionHeader({ eyebrow, title, description, level = 'h2', align = 'left' }: SectionHeaderProps) {
  const Heading = level;
  const isCentered = align === 'center';

  return (
    <div
      className={cn(
        'mb-7 flex max-w-3xl flex-col gap-2',
        isCentered && 'mx-auto items-center text-center',
      )}
    >
      {eyebrow ? (
        <p className="bg-gradient-brand bg-clip-text text-xs font-bold uppercase tracking-[0.22em] text-transparent">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="text-2xl font-bold leading-tight sm:text-3xl">{title}</Heading>
      {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
