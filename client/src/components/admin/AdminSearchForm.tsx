type AdminSearchFormProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  placeholder?: string;
};

export function AdminSearchForm({ value, onChange, onSubmit, placeholder }: AdminSearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex max-w-md gap-2">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="rounded-lg border border-input bg-background px-4 text-sm font-semibold hover:bg-accent"
      >
        Search
      </button>
    </form>
  );
}
