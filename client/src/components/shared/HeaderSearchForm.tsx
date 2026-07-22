import { Mic, Search } from 'lucide-react';
import type { FormEvent } from 'react';

import { SEARCH_PLACEHOLDER_PHRASES } from '@/constants/search';
import { useRotatingPlaceholder } from '@/hooks/useRotatingPlaceholder';
import { cn } from '@/utils/cn';

type HeaderSearchFormProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  isVoiceSupported: boolean;
  isVoiceListening: boolean;
  onToggleVoice: () => void;
  className?: string;
};

export function HeaderSearchForm({
  id,
  value,
  onChange,
  onSubmit,
  isVoiceSupported,
  isVoiceListening,
  onToggleVoice,
  className,
}: HeaderSearchFormProps) {
  const placeholder = useRotatingPlaceholder(SEARCH_PLACEHOLDER_PHRASES);

  return (
    <form className={cn('flex items-center', className)} role="search" onSubmit={onSubmit}>
      <label htmlFor={id} className="sr-only">
        Search snacks
      </label>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(
            'h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20',
            isVoiceSupported && 'pr-10',
          )}
        />
        {isVoiceSupported ? (
          <button
            type="button"
            aria-label={isVoiceListening ? 'Listening…' : 'Search by voice'}
            onClick={onToggleVoice}
            className={cn(
              'absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-primary',
              isVoiceListening && 'animate-pulse text-primary',
            )}
          >
            <Mic className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </form>
  );
}
