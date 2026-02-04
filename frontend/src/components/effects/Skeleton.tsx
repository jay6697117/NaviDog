import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

const shimmerStyle: React.CSSProperties = {
  background: `linear-gradient(
    90deg,
    var(--color-bg-layout) 25%,
    var(--color-surface-hover) 50%,
    var(--color-bg-layout) 75%
  )`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  className = '',
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        ...shimmerStyle,
        width,
        height,
        borderRadius,
      }}
    />
  );
};

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="skeleton-table" style={{ padding: 16 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {Array(cols).fill(0).map((_, i) => (
          <Skeleton key={`header-${i}`} height={20} borderRadius={4} />
        ))}
      </div>
      {Array(rows).fill(0).map((_, r) => (
        <div
          key={`row-${r}`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 12,
            marginBottom: 12,
          }}
        >
          {Array(cols).fill(0).map((_, c) => (
            <Skeleton
              key={`cell-${r}-${c}`}
              height={16}
              width={`${60 + Math.random() * 40}%`}
              borderRadius={4}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface TreeSkeletonProps {
  items?: number;
}

export const TreeSkeleton: React.FC<TreeSkeletonProps> = ({ items = 5 }) => {
  return (
    <div className="skeleton-tree" style={{ padding: 8 }}>
      {Array(items).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            paddingLeft: i % 3 === 0 ? 0 : i % 3 === 1 ? 20 : 40,
          }}
        >
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width={`${80 + Math.random() * 60}px`} height={14} borderRadius={4} />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
