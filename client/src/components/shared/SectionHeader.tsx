type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-7 flex max-w-3xl flex-col gap-2">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
      {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
