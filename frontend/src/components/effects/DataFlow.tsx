import React from 'react';

interface DataFlowProps {
  active: boolean;
  width?: number;
  height?: number;
  color?: string;
  particleCount?: number;
}

export const DataFlow: React.FC<DataFlowProps> = ({
  active,
  width = 200,
  height = 60,
  color = '#1890ff',
  particleCount = 5,
}) => {
  if (!active) return null;

  return (
    <svg
      width={width}
      height={height}
      className="data-flow-svg"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 100,
        filter: `drop-shadow(0 0 4px ${color}66)`,
      }}
    >
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        id="flowPath"
        d={`M 0,${height / 2} Q ${width / 4},${height * 0.2} ${width / 2},${height / 2} T ${width},${height / 2}`}
        fill="none"
        stroke="url(#flowGradient)"
        strokeWidth="2"
        strokeDasharray="8 4"
        opacity="0.3"
      />
      {Array(particleCount).fill(0).map((_, i) => (
        <circle key={i} r="3" fill={color}>
          <animateMotion dur="1.2s" repeatCount="indefinite" begin={`${i * (1.2 / particleCount)}s`}>
            <mpath href="#flowPath" />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" dur="1.2s" repeatCount="indefinite" begin={`${i * (1.2 / particleCount)}s`} />
        </circle>
      ))}
    </svg>
  );
};

export default DataFlow;
