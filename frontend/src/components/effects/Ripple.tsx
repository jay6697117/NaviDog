import React, { useState, useLayoutEffect } from 'react';

interface RippleStyle {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface RippleProps {
  duration?: number;
  color?: string;
}

const rippleContainerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  borderRadius: 'inherit',
  pointerEvents: 'none',
};

export const Ripple: React.FC<RippleProps> = ({
  duration = 600,
  color = 'rgba(255, 255, 255, 0.4)',
}) => {
  const [ripples, setRipples] = useState<RippleStyle[]>([]);

  useLayoutEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples([]);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [ripples, duration]);

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    setRipples([...ripples, { left: x, top: y, width: size, height: size }]);
  };

  return (
    <div style={rippleContainerStyle} onMouseDown={addRipple}>
      {ripples.map((ripple, index) => (
        <span
          key={index}
          style={{
            position: 'absolute',
            left: ripple.left,
            top: ripple.top,
            width: ripple.width,
            height: ripple.height,
            backgroundColor: color,
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: `ripple ${duration}ms ease-out`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
};

export default Ripple;
