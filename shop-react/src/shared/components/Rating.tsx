import { Star } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

interface RatingProps {
  value: number;
  reviewCount?: number;
  className?: string;
}

export function Rating({ value, reviewCount, className }: RatingProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-sand-100/60', className)}>
      <Star className="h-3.5 w-3.5 fill-signal-400 text-signal-400" aria-hidden="true" />
      <span className="font-semibold text-sand-100/90">{value.toFixed(1)}</span>
      {reviewCount !== undefined && <span>({reviewCount})</span>}
      <span className="sr-only">
        Calificación {value.toFixed(1)} de 5
        {reviewCount !== undefined ? `, ${reviewCount} reseñas` : ''}
      </span>
    </span>
  );
}
