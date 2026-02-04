import React from 'react';

interface ProgressBarProps {
  indeterminate?: boolean;
  progress?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  indeterminate = true,
  progress = 0,
  height = 2,
  color,
  className = '',
}) => {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height,
    overflow: 'hidden',
    background: 'transparent',
  };

  const barStyle: React.CSSProperties = indeterminate
    ? {
        position: 'absolute',
        height: '100%',
        background: color || 'linear-gradient(90deg, #1890ff, #722ed1)',
        animation: 'progress-indeterminate 1.5s ease-in-out infinite',
      }
    : {
        height: '100%',
        width: `${Math.min(100, Math.max(0, progress))}%`,
        background: color || 'linear-gradient(90deg, #1890ff, #722ed1)',
        transition: 'width 300ms ease-out',
      };

  return (
    <div className={`progress-bar ${className}`} style={containerStyle}>
      <div style={barStyle} />
    </div>
  );
};

export default ProgressBar;
