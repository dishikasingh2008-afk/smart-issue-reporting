import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star
            size={size}
            className={n <= display ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
          />
        </button>
      ))}
    </div>
  );
}
