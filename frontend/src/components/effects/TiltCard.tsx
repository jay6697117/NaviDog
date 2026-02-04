import React, { useRef, useCallback, PropsWithChildren } from 'react';

interface TiltCardProps {
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  transitionDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TiltCard: React.FC<PropsWithChildren<TiltCardProps>> = ({
  children,
  maxTilt = 10,
  scale = 1.02,
  perspective = 1000,
  transitionDuration = 150,
  className = '',
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `perspective(${perspective}px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale3d(${scale}, ${scale}, ${scale})`;
  }, [maxTilt, scale, perspective]);

  const handleMouseLeave = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    element.style.transform = `perspective(${perspective}px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
  }, [perspective]);

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transition: `transform ${transitionDuration}ms ease-out, box-shadow ${transitionDuration}ms ease-out`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default TiltCard;
