import { ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: string;
  glow?: boolean;
  tilt?: boolean;
  glass?: boolean;
  depth?: 'flat' | 'raised' | 'floating';
}

const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'p-6',
  glow = false,
  tilt = false,
  glass = false,
  depth = 'raised',
}: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setGlareX((x / rect.width) * 100);
    setGlareY((y / rect.height) * 100);

    if (tilt) {
      setRotateX(((y - centerY) / centerY) * -6);
      setRotateY(((x - centerX) / centerX) * 6);
    }
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlareX(50);
    setGlareY(50);
  };

  const depthShadow =
    depth === 'floating'
      ? '0 12px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
      : depth === 'raised'
        ? '0 4px 16px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)'
        : '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)';

  return (
    <motion.div
      ref={ref}
      className={`rounded-2xl border border-white/[0.06] ${padding} transition-all duration-300 relative overflow-hidden ${
        !glass ? 'bg-[#1E293B]' : ''
      } ${hover ? 'cursor-pointer' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: tilt ? 'preserve-3d' : undefined,
        transform: tilt ? `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : undefined,
        boxShadow: glow
          ? `${depthShadow}, 0 0 30px rgba(13,162,231,0.15)`
          : depthShadow,
        ...(glass ? {
          background: 'linear-gradient(145deg, rgba(30,41,59,0.45), rgba(15,23,42,0.35))',
          backdropFilter: 'blur(32px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
        } : {}),
      }}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: `0 20px 60px -15px rgba(13,162,231,0.2), 0 0 50px -10px rgba(13,162,231,0.1), inset 0 1px 0 rgba(255,255,255,0.08)`,
              borderColor: 'rgba(13, 162, 231, 0.25)',
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Inner highlight / glare layer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.04] transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8), transparent 60%)`,
        }}
      />
      {/* Top edge light */}
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      {/* Content */}
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
};

export default Card;
