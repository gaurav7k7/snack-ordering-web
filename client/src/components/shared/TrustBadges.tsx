import { Award, ShieldCheck } from 'lucide-react';

type TrustBadgesProps = {
  isoText: string;
  dataProtectionText: string;
  className?: string;
};

/** ISO certification + data-protection trust marks — shown in the footer, admin-editable via Site Settings. */
export function TrustBadges({ isoText, dataProtectionText, className }: TrustBadgesProps) {
  if (!isoText && !dataProtectionText) return null;

  return (
    <div className={className ? `flex flex-wrap items-center gap-x-8 gap-y-4 ${className}` : 'flex flex-wrap items-center gap-x-8 gap-y-4'}>
      {isoText ? (
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-secondary/60 text-secondary">
            <Award className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="max-w-[180px] text-sm font-semibold leading-tight">{isoText}</span>
        </div>
      ) : null}
      {dataProtectionText ? (
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-secondary/60 text-secondary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="max-w-[180px] text-sm font-semibold leading-tight">{dataProtectionText}</span>
        </div>
      ) : null}
    </div>
  );
}
