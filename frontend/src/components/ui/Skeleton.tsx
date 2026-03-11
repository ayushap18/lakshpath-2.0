interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) => {
  const baseStyle = {
    background: 'linear-gradient(90deg, rgba(17,24,39,0.8) 0%, rgba(17,24,39,0.6) 50%, rgba(17,24,39,0.8) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
  };

  if (variant === 'card') {
    return (
      <div
        className={`rounded-2xl border border-white/[0.04] p-5 ${className}`}
        style={{
          background: 'rgba(17,24,39,0.5)',
          width: width ?? '100%',
          height: height ?? 'auto',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="h-4 w-24 rounded-md" style={baseStyle} />
          <div className="w-10 h-10 rounded-xl" style={baseStyle} />
        </div>
        <div className="h-7 w-20 rounded-md mb-3" style={baseStyle} />
        <div className="h-3 w-32 rounded-md" style={baseStyle} />
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={`rounded-full ${className}`}
        style={{
          ...baseStyle,
          width: width ?? 40,
          height: height ?? 40,
        }}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={`rounded-xl ${className}`}
        style={{
          ...baseStyle,
          width: width ?? '100%',
          height: height ?? 120,
        }}
      />
    );
  }

  // Text variant — supports multiple lines
  return (
    <div className={`flex flex-col gap-2.5 ${className}`} style={{ width: width ?? '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="rounded-md"
          style={{
            ...baseStyle,
            height: height ?? 14,
            width: i === lines - 1 && lines > 1 ? '70%' : '100%',
          }}
        />
      ))}
    </div>
  );
};

// Pre-built skeleton presets for common layouts
export const SkeletonStatCard = ({ className = '' }: { className?: string }) => (
  <Skeleton variant="card" className={className} />
);

export const SkeletonList = ({ items = 3, className = '' }: { items?: number; className?: string }) => (
  <div className={`flex flex-col gap-3 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton variant="circular" width={36} height={36} />
        <div className="flex-1">
          <Skeleton variant="text" height={12} />
          <Skeleton variant="text" width="60%" height={10} className="mt-1.5" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart = ({ className = '' }: { className?: string }) => (
  <Skeleton variant="rectangular" height={200} className={className} />
);

export default Skeleton;
