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
  const displayItems = hasQuery ? suggestions : popularSearches;
  const hasNoMatches = hasQuery && suggestions.length === 0;

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold text-muted-foreground">
        {hasQuery ? 'Search suggestions' : 'Popular searches'}
      </p>
      {hasNoMatches ? (
        <p className="mt-3 text-sm text-muted-foreground">No matches found for your search.</p>
      ) : (
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
      )}
    </div>
  );
}
