'use client'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

export default function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const sz = size === 'sm' ? 'text-base' : 'text-2xl'

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`${sz} leading-none transition-opacity ${onChange ? 'cursor-pointer hover:opacity-70' : 'cursor-default'} ${star <= value ? 'text-ink' : 'text-line'}`}
          aria-label={`${star}점`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
