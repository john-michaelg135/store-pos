interface ProductImageProps {
  src?: string;
  category: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-full h-32',
};

function getCategoryColor(category: string): { bg: string; fg: string } {
  const normalized = category.toLowerCase();
  if (normalized.includes('drink') || normalized.includes('beverage')) {
    return { bg: '#E8F4FD', fg: '#2196F3' };
  }
  if (normalized.includes('snack')) {
    return { bg: '#FFF3E0', fg: '#FF9800' };
  }
  if (normalized.includes('noodle') || normalized.includes('pasta')) {
    return { bg: '#FBE9E7', fg: '#FF5722' };
  }
  if (normalized.includes('canned')) {
    return { bg: '#E8F5E9', fg: '#4CAF50' };
  }
  if (normalized.includes('condiment') || normalized.includes('sauce')) {
    return { bg: '#F3E5F5', fg: '#9C27B0' };
  }
  if (normalized.includes('staple') || normalized.includes('rice')) {
    return { bg: '#FFF8E1', fg: '#FFC107' };
  }
  return { bg: '#F5F1E8', fg: '#B38B6D' };
}

function getCategoryIcon(category: string): JSX.Element {
  const normalized = category.toLowerCase();
  const { fg } = getCategoryColor(category);

  if (normalized.includes('drink') || normalized.includes('beverage')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={fg} strokeWidth="1.5">
        <path d="M8 2h8l-1 4H9L8 2z" />
        <path d="M9 6h6v14a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
        <path d="M9 12h6" />
      </svg>
    );
  }
  if (normalized.includes('snack')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={fg} strokeWidth="1.5">
        <path d="M4 8c0-2 2-4 8-4s8 2 8 4v2c0 1-1 2-2 2H6c-1 0-2-1-2-2V8z" />
        <path d="M6 12v8a2 2 0 002 2h8a2 2 0 002-2v-8" />
        <path d="M9 15h6" />
      </svg>
    );
  }
  if (normalized.includes('noodle') || normalized.includes('pasta')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={fg} strokeWidth="1.5">
        <path d="M4 14c0 4 3.5 6 8 6s8-2 8-6" />
        <ellipse cx="12" cy="14" rx="8" ry="3" />
        <path d="M7 8c1-3 3-4 5-4s4 1 5 4" />
        <path d="M9 10c0-1 1-2 3-2s3 1 3 2" />
      </svg>
    );
  }
  if (normalized.includes('canned')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={fg} strokeWidth="1.5">
        <ellipse cx="12" cy="6" rx="6" ry="2" />
        <path d="M6 6v12c0 1.1 2.7 2 6 2s6-.9 6-2V6" />
        <path d="M6 12c0 1.1 2.7 2 6 2s6-.9 6-2" />
      </svg>
    );
  }
  if (normalized.includes('condiment') || normalized.includes('sauce')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={fg} strokeWidth="1.5">
        <path d="M10 2h4v3h-4z" />
        <path d="M9 5h6l1 3H8l1-3z" />
        <path d="M8 8h8v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V8z" />
        <path d="M10 13h4" />
      </svg>
    );
  }
  if (normalized.includes('staple') || normalized.includes('rice')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={fg} strokeWidth="1.5">
        <path d="M12 3c-2 2-4 5-4 8s2 5 4 5 4-2 4-5-2-6-4-8z" />
        <path d="M12 8v8" />
        <path d="M5 18h14" />
        <path d="M7 21h10" />
      </svg>
    );
  }
  // Default
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={fg} strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 16l4-4 3 3 5-5 4 4" />
      <circle cx="9" cy="9" r="1.5" />
    </svg>
  );
}

export default function ProductImage({ src, category, alt, size = 'md' }: ProductImageProps) {
  const { bg } = getCategoryColor(category);

  if (src) {
    return (
      <div className={`${sizeClasses[size]} rounded-[2px] overflow-hidden bg-[#F5F1E8] dark:bg-[#2a2a2a]`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-[2px] flex items-center justify-center`}
      style={{ backgroundColor: bg }}
    >
      <div className="opacity-70">
        {getCategoryIcon(category)}
      </div>
    </div>
  );
}
