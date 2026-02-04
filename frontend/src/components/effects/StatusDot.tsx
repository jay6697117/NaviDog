import React from 'react';

type StatusType = 'connected' | 'connecting' | 'disconnected' | 'error';

interface StatusDotProps {
  status: StatusType;
  size?: number;
  showHeartbeat?: boolean;
}

const statusColors: Record<StatusType, string> = {
  connected: '#52c41a',
  connecting: '#1890ff',
  disconnected: '#8c8c8c',
  error: '#ff4d4f',
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 8,
  showHeartbeat = false,
}) => {
  const color = statusColors[status];

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  };

  if (status === 'connecting') {
    return (
      <span
        style={{
          ...baseStyle,
          border: `2px solid ${color}`,
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
          background: 'transparent',
        }}
      />
    );
  }

  const animation =
    status === 'connected'
      ? showHeartbeat
        ? 'heartbeat 3s ease-in-out infinite'
        : 'pulse-alive 2s ease-in-out infinite'
      : 'none';

  return (
    <span
      style={{
        ...baseStyle,
        backgroundColor: color,
        animation,
        boxShadow: status === 'connected' ? `0 0 ${size}px ${color}` : 'none',
      }}
    />
  );
};

export default StatusDot;
