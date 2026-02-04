import React from 'react';

interface WaveDividerProps {
  color?: string;
  height?: number;
  animated?: boolean;
  className?: string;
}

export const WaveDivider: React.FC<WaveDividerProps> = ({
  color = '#1890ff',
  height = 10,
  animated = true,
  className = '',
}) => {
  const gradientId = `wave-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <svg
      className={`wave-divider ${className}`}
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      style={{ width: '100%', height, opacity: 0.5, display: 'block' }}
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d="M0,5 Q25,0 50,5 T100,5" fill="none" stroke={`url(#${gradientId})`} strokeWidth="0.5">
        {animated && (
          <animate
            attributeName="d"
            values="M0,5 Q25,0 50,5 T100,5; M0,5 Q25,10 50,5 T100,5; M0,5 Q25,0 50,5 T100,5"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
      </path>
    </svg>
  );
};

export default WaveDivider;
