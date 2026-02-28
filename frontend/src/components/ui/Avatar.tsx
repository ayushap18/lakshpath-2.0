interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const Avatar = ({ src, name, size = 'md', className = '', ring = false }: AvatarProps) => {
  const sizes: Record<string, string> = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const ringStyles = ring ? {
    boxShadow: '0 0 0 2px rgba(10,15,28,1), 0 0 0 4px rgba(13,162,231,0.4)',
  } : {};

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
        style={{
          border: '2px solid rgba(13,162,231,0.3)',
          ...ringStyles,
        }}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #0da2e7, #8B5CF6)',
        ...ringStyles,
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
