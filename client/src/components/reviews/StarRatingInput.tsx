import { Star } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const activeValue = hovered || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          className="p-0.5"
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              star <= activeValue ? 'fill-secondary text-secondary' : 'text-muted-foreground',
            )}
          />
        </button>
      ))}
    </div>
  );
}
