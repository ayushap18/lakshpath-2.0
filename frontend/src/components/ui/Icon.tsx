interface IconProps {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}

const Icon = ({ name, size = 24, className = '', filled = false, style }: IconProps) => {
  return (
    <span
      className={`material-symbols-rounded ${filled ? 'filled' : ''} ${className}`}
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  );
};

export default Icon;
