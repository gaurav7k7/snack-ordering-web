import { useMemo } from 'react';

type SearchSuggestionsProps = {
  query: string;
  suggestions: string[];
  popularSearches: string[];
  onSuggestionClick: (value: string) => void;
};

export function SearchSuggestions({
  query,
  suggestions,
  popularSearches,
  onSuggestionClick,
}: SearchSuggestionsProps) {
  const hasQuery = query.trim().length > 0;

  const displayItems = useMemo(() => {
    if (hasQuery) {
      return suggestions.length > 0 ? suggestions : ['No matches found for your search'];
    }

    return popularSearches;
  }, [hasQuery, suggestions, popularSearches]);

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold text-muted-foreground">
        {hasQuery ? 'Search suggestions' : 'Popular searches'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {displayItems.map((item) => (
          <button
            type="button"
            key={item}
            className="rounded-full border border-muted px-3 py-2 text-sm transition hover:border-primary hover:text-primary"
            onClick={() => onSuggestionClick(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
