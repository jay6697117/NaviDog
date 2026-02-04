# GoNavi UI 特效优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 GoNavi 数据库管理工具实现完整的 2D/3D 视觉特效系统，包括交互反馈、状态指示、氛围装饰和 3D 太空拓扑图。

**Architecture:** 采用分层架构 - 基础 CSS 动画层、React 组件特效层、Three.js 3D 渲染层。所有特效通过 CSS 变量和 Zustand 状态管理实现主题适配。3D 拓扑图作为侧边栏的可切换视图模式。

**Tech Stack:** React 18, Three.js, React Three Fiber, Lottie, CSS Animations, Zustand

---

## 阶段概览

| 阶段 | 任务数 | 预计时间 |
|-----|-------|---------|
| P0: 依赖安装与基础设置 | 3 | 15 min |
| P1: 交互反馈特效 | 8 | 40 min |
| P2: 状态指示特效 | 10 | 50 min |
| P3: 氛围装饰特效 | 8 | 40 min |
| P4: 2D 特效 | 8 | 40 min |
| P5: 3D 基础特效 | 6 | 30 min |
| P6: 3D 太空拓扑图 | 16 | 80 min |

---

## P0: 依赖安装与基础设置

### Task 1: 安装新依赖

**Files:**
- Modify: `frontend/package.json`

**Step 1: 安装 Three.js 相关依赖**

Run:
```bash
cd /Users/zhangjinhui/Desktop/NaviDog/frontend && npm install @react-three/fiber@^8.15.0 @react-three/drei@^9.88.0 three@^0.160.0
```

**Step 2: 安装 Lottie 依赖**

Run:
```bash
cd /Users/zhangjinhui/Desktop/NaviDog/frontend && npm install lottie-react@^2.4.0
```

**Step 3: 安装 TypeScript 类型**

Run:
```bash
cd /Users/zhangjinhui/Desktop/NaviDog/frontend && npm install -D @types/three@^0.160.0
```

**Step 4: 验证安装**

Run:
```bash
cd /Users/zhangjinhui/Desktop/NaviDog/frontend && npm ls @react-three/fiber three lottie-react
```
Expected: 显示已安装的包版本

**Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add Three.js, React Three Fiber, and Lottie dependencies"
```

---

### Task 2: 创建目录结构

**Files:**
- Create: `frontend/src/components/effects/` (directory)
- Create: `frontend/src/components/topology/` (directory)
- Create: `frontend/src/styles/` (directory)
- Create: `frontend/src/assets/lottie/` (directory)

**Step 1: 创建目录**

Run:
```bash
mkdir -p /Users/zhangjinhui/Desktop/NaviDog/frontend/src/components/effects
mkdir -p /Users/zhangjinhui/Desktop/NaviDog/frontend/src/components/topology
mkdir -p /Users/zhangjinhui/Desktop/NaviDog/frontend/src/styles
mkdir -p /Users/zhangjinhui/Desktop/NaviDog/frontend/src/assets/lottie
```

**Step 2: 创建 index 导出文件**

Create `frontend/src/components/effects/index.ts`:
```typescript
// Effects components barrel export
export {};
```

Create `frontend/src/components/topology/index.ts`:
```typescript
// Topology components barrel export
export {};
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects frontend/src/components/topology frontend/src/styles frontend/src/assets/lottie
git commit -m "chore: create directory structure for effects and topology"
```

---

### Task 3: 创建特效样式基础文件

**Files:**
- Create: `frontend/src/styles/effects.css`
- Create: `frontend/src/styles/topology.css`
- Modify: `frontend/src/main.tsx`

**Step 1: 创建 effects.css**

Create `frontend/src/styles/effects.css`:
```css
/* ========================================
   GoNavi UI Effects Stylesheet
   ======================================== */

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ----------------------------------------
   Animation Keyframes
   ---------------------------------------- */

/* Ripple effect */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Success flash */
@keyframes success-flash {
  0%, 100% { box-shadow: inset 0 0 0 2px transparent; }
  50% { box-shadow: inset 0 0 0 2px #52c41a; }
}

/* Error shake */
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

/* Shimmer for skeleton */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Pulse alive for connection status */
@keyframes pulse-alive {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* Pulse dot for executing state */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

/* Progress indeterminate */
@keyframes progress-indeterminate {
  0% { left: -30%; width: 30%; }
  50% { left: 50%; width: 30%; }
  100% { left: 100%; width: 30%; }
}

/* Heartbeat */
@keyframes heartbeat {
  0%, 90%, 100% { transform: scale(1); }
  95% { transform: scale(1.15); }
}

/* Float animation */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Pulse glow */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(24, 144, 255, 0); }
}

/* Cell saved */
@keyframes cell-saved {
  0% { background: rgba(82, 196, 26, 0.3); }
  100% { background: transparent; }
}

/* Row delete */
@keyframes row-delete {
  to {
    opacity: 0;
    transform: translateX(-100%);
    height: 0;
    padding: 0;
    margin: 0;
  }
}

/* Row insert */
@keyframes row-insert {
  from {
    opacity: 0;
    transform: translateY(20px);
    background: rgba(24, 144, 255, 0.1);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    background: transparent;
  }
}

/* Tab close */
@keyframes tab-close {
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
}

/* Modal fly in */
@keyframes modal-fly-in {
  0% {
    transform: perspective(1000px) translateZ(-300px) rotateX(15deg);
    opacity: 0;
  }
  100% {
    transform: perspective(1000px) translateZ(0) rotateX(0);
    opacity: 1;
  }
}

/* Modal fly out */
@keyframes modal-fly-out {
  to {
    transform: perspective(1000px) translateZ(-200px) rotateX(-10deg);
    opacity: 0;
  }
}

/* Sidebar flip */
@keyframes sidebar-flip {
  0% { transform: perspective(1000px) rotateY(0); opacity: 1; }
  100% { transform: perspective(1000px) rotateY(-90deg); opacity: 0; width: 0; }
}

@keyframes sidebar-flip-in {
  0% { transform: perspective(1000px) rotateY(-90deg); opacity: 0; }
  100% { transform: perspective(1000px) rotateY(0); opacity: 1; }
}

/* Spin */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Step 2: 创建 topology.css**

Create `frontend/src/styles/topology.css`:
```css
/* ========================================
   GoNavi 3D Topology Stylesheet
   ======================================== */

.view-toggle {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
}

.view-toggle .ant-btn {
  flex: 1;
}

.topology-canvas {
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, #0a0a1a 0%, #000008 100%);
}

.planet-tooltip {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  transform: translateX(-50%);
}

.planet-tooltip strong {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.planet-tooltip span {
  color: rgba(255, 255, 255, 0.6);
}

.topology-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
}
```

**Step 3: 在 main.tsx 中导入样式**

Modify `frontend/src/main.tsx` - 在现有 import 后添加:
```typescript
import './styles/effects.css';
import './styles/topology.css';
```

**Step 4: 验证构建**

Run:
```bash
cd /Users/zhangjinhui/Desktop/NaviDog/frontend && npm run build
```
Expected: 构建成功无错误

**Step 5: Commit**

```bash
git add frontend/src/styles frontend/src/main.tsx
git commit -m "feat: add base effect and topology stylesheets"
```

---

## P1: 交互反馈特效

### Task 4: 实现 Ripple 涟漪按钮组件

**Files:**
- Create: `frontend/src/components/effects/Ripple.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 Ripple 组件**

Create `frontend/src/components/effects/Ripple.tsx`:
```tsx
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
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
```

**Step 3: 验证构建**

Run:
```bash
cd /Users/zhangjinhui/Desktop/NaviDog/frontend && npm run build
```
Expected: 构建成功

**Step 4: Commit**

```bash
git add frontend/src/components/effects/Ripple.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add Ripple effect component"
```

---

### Task 5: 实现 RippleButton 包装组件

**Files:**
- Create: `frontend/src/components/effects/RippleButton.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 RippleButton 组件**

Create `frontend/src/components/effects/RippleButton.tsx`:
```tsx
import React from 'react';
import { Button, ButtonProps } from 'antd';
import { Ripple } from './Ripple';

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
  rippleDuration?: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  rippleColor,
  rippleDuration,
  style,
  ...props
}) => {
  return (
    <Button
      {...props}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
      <Ripple color={rippleColor} duration={rippleDuration} />
    </Button>
  );
};

export default RippleButton;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/RippleButton.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add RippleButton wrapper component"
```

---

### Task 6: 添加操作反馈样式类

**Files:**
- Modify: `frontend/src/styles/effects.css`

**Step 1: 添加反馈样式类**

Append to `frontend/src/styles/effects.css`:
```css
/* ----------------------------------------
   Interaction Feedback Classes
   ---------------------------------------- */

/* Success flash effect */
.effect-success-flash {
  animation: success-flash 600ms ease-out;
}

/* Error shake effect */
.effect-error-shake {
  animation: error-shake 400ms ease-out;
}

/* Error flash + shake combined */
.effect-error {
  animation: error-shake 400ms ease-out;
  box-shadow: inset 0 0 0 2px #ff4d4f !important;
}

/* Dragging item highlight */
.effect-dragging {
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(24, 144, 255, 0.4);
  z-index: 1000;
  opacity: 0.9;
}

/* Drop indicator line */
.effect-drop-indicator {
  height: 2px;
  background: linear-gradient(90deg, transparent, #1890ff, transparent);
  pointer-events: none;
}

/* Tree node stagger enter */
.tree-node-stagger-enter {
  opacity: 0;
  transform: translateX(-10px);
}

.tree-node-stagger-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 200ms var(--motion-ease-out);
}

/* Generate stagger delays for up to 20 items */
.tree-node-stagger-enter-active:nth-child(1) { transition-delay: 0ms; }
.tree-node-stagger-enter-active:nth-child(2) { transition-delay: 30ms; }
.tree-node-stagger-enter-active:nth-child(3) { transition-delay: 60ms; }
.tree-node-stagger-enter-active:nth-child(4) { transition-delay: 90ms; }
.tree-node-stagger-enter-active:nth-child(5) { transition-delay: 120ms; }
.tree-node-stagger-enter-active:nth-child(6) { transition-delay: 150ms; }
.tree-node-stagger-enter-active:nth-child(7) { transition-delay: 180ms; }
.tree-node-stagger-enter-active:nth-child(8) { transition-delay: 210ms; }
.tree-node-stagger-enter-active:nth-child(9) { transition-delay: 240ms; }
.tree-node-stagger-enter-active:nth-child(10) { transition-delay: 270ms; }
```

**Step 2: Commit**

```bash
git add frontend/src/styles/effects.css
git commit -m "feat: add interaction feedback CSS classes"
```

---

### Task 7: 创建 useFlashEffect Hook

**Files:**
- Create: `frontend/src/components/effects/useFlashEffect.ts`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 Hook**

Create `frontend/src/components/effects/useFlashEffect.ts`:
```typescript
import { useCallback, useRef } from 'react';

type EffectType = 'success' | 'error';

interface UseFlashEffectReturn {
  triggerFlash: (type: EffectType) => void;
  ref: React.RefObject<HTMLDivElement>;
}

export const useFlashEffect = (): UseFlashEffectReturn => {
  const ref = useRef<HTMLDivElement>(null);

  const triggerFlash = useCallback((type: EffectType) => {
    const element = ref.current;
    if (!element) return;

    const className = type === 'success' ? 'effect-success-flash' : 'effect-error';

    // Remove existing animation class
    element.classList.remove('effect-success-flash', 'effect-error');

    // Force reflow
    void element.offsetWidth;

    // Add animation class
    element.classList.add(className);

    // Remove after animation completes
    const duration = type === 'success' ? 600 : 400;
    setTimeout(() => {
      element.classList.remove(className);
    }, duration);
  }, []);

  return { triggerFlash, ref };
};

export default useFlashEffect;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
export { useFlashEffect } from './useFlashEffect';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/useFlashEffect.ts frontend/src/components/effects/index.ts
git commit -m "feat: add useFlashEffect hook for success/error feedback"
```

---

## P2: 状态指示特效

### Task 8: 实现 Skeleton 骨架屏组件

**Files:**
- Create: `frontend/src/components/effects/Skeleton.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 Skeleton 组件**

Create `frontend/src/components/effects/Skeleton.tsx`:
```tsx
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
      {/* Header */}
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
        {Array(cols)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={`header-${i}`} height={20} borderRadius={4} />
          ))}
      </div>
      {/* Rows */}
      {Array(rows)
        .fill(0)
        .map((_, r) => (
          <div
            key={`row-${r}`}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 12,
              marginBottom: 12,
            }}
          >
            {Array(cols)
              .fill(0)
              .map((_, c) => (
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
      {Array(items)
        .fill(0)
        .map((_, i) => (
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
            <Skeleton
              width={`${80 + Math.random() * 60}px`}
              height={14}
              borderRadius={4}
            />
          </div>
        ))}
    </div>
  );
};

export default Skeleton;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
export { useFlashEffect } from './useFlashEffect';
export { Skeleton, TableSkeleton, TreeSkeleton } from './Skeleton';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/Skeleton.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add Skeleton, TableSkeleton, TreeSkeleton components"
```

---

### Task 9: 实现 StatusDot 连接状态指示器

**Files:**
- Create: `frontend/src/components/effects/StatusDot.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 StatusDot 组件**

Create `frontend/src/components/effects/StatusDot.tsx`:
```tsx
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
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
export { useFlashEffect } from './useFlashEffect';
export { Skeleton, TableSkeleton, TreeSkeleton } from './Skeleton';
export { StatusDot } from './StatusDot';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/StatusDot.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add StatusDot connection status indicator"
```

---

### Task 10: 实现 ProgressBar 进度指示条

**Files:**
- Create: `frontend/src/components/effects/ProgressBar.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 ProgressBar 组件**

Create `frontend/src/components/effects/ProgressBar.tsx`:
```tsx
import React from 'react';

interface ProgressBarProps {
  indeterminate?: boolean;
  progress?: number; // 0-100
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
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
export { useFlashEffect } from './useFlashEffect';
export { Skeleton, TableSkeleton, TreeSkeleton } from './Skeleton';
export { StatusDot } from './StatusDot';
export { ProgressBar } from './ProgressBar';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/ProgressBar.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add ProgressBar component with indeterminate mode"
```

---

### Task 11: 添加数据操作过渡样式

**Files:**
- Modify: `frontend/src/styles/effects.css`

**Step 1: 添加数据操作样式**

Append to `frontend/src/styles/effects.css`:
```css
/* ----------------------------------------
   Data Operation Transitions
   ---------------------------------------- */

/* Cell just saved - green flash */
.cell-just-saved {
  animation: cell-saved 800ms ease-out;
}

/* Row deleting - slide out left */
.row-deleting {
  animation: row-delete 300ms ease-out forwards;
  pointer-events: none;
}

/* Row inserted - slide in from bottom with highlight */
.row-inserted {
  animation: row-insert 400ms ease-out;
}

/* Tab executing indicator */
.tab-executing {
  position: relative;
}

.tab-executing::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1890ff;
  animation: pulse-dot 1s ease-in-out infinite;
}

/* Empty state animations */
.empty-state-icon {
  animation: float 3s ease-in-out infinite;
}

.empty-state-cta {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Tab content transitions */
.tab-content-enter {
  opacity: 0;
  transform: translateY(8px);
}

.tab-content-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms var(--motion-ease-out);
}

.tab-content-exit {
  opacity: 1;
}

.tab-content-exit-active {
  opacity: 0;
  transition: opacity 150ms ease-out;
}

.tab-closing {
  animation: tab-close 200ms ease-out forwards;
}
```

**Step 2: Commit**

```bash
git add frontend/src/styles/effects.css
git commit -m "feat: add data operation transition styles"
```

---

### Task 12: 实现 EmptyState 空状态组件

**Files:**
- Create: `frontend/src/components/effects/EmptyState.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 EmptyState 组件**

Create `frontend/src/components/effects/EmptyState.tsx`:
```tsx
import React from 'react';
import { Button, ButtonProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionProps?: ButtonProps;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionProps,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center',
        height: '100%',
        minHeight: 200,
      }}
    >
      {icon && (
        <div
          className="empty-state-icon"
          style={{
            fontSize: 48,
            color: 'var(--color-text-secondary)',
            marginBottom: 16,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          margin: 0,
          marginBottom: 8,
          color: 'var(--color-text-primary)',
          fontWeight: 500,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: 0,
            marginBottom: 16,
            color: 'var(--color-text-secondary)',
            fontSize: 14,
          }}
        >
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAction}
          className="empty-state-cta"
          {...actionProps}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
export { useFlashEffect } from './useFlashEffect';
export { Skeleton, TableSkeleton, TreeSkeleton } from './Skeleton';
export { StatusDot } from './StatusDot';
export { ProgressBar } from './ProgressBar';
export { EmptyState } from './EmptyState';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/EmptyState.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add EmptyState component with floating animation"
```

---

## P3: 氛围装饰特效

### Task 13: 添加 Glassmorphism 毛玻璃样式

**Files:**
- Modify: `frontend/src/styles/effects.css`

**Step 1: 添加毛玻璃样式**

Append to `frontend/src/styles/effects.css`:
```css
/* ----------------------------------------
   Glassmorphism Effects
   ---------------------------------------- */

.glass-effect {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

[data-theme='dark'] .glass-effect {
  background: rgba(20, 24, 33, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Glass modal specific */
.glass-modal .ant-modal-content {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-2);
}

[data-theme='dark'] .glass-modal .ant-modal-content {
  background: rgba(20, 24, 33, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glass dropdown */
.glass-dropdown .ant-dropdown-menu {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

[data-theme='dark'] .glass-dropdown .ant-dropdown-menu {
  background: rgba(20, 24, 33, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

**Step 2: Commit**

```bash
git add frontend/src/styles/effects.css
git commit -m "feat: add glassmorphism effect styles"
```

---

### Task 14: 添加侧边栏装饰样式

**Files:**
- Modify: `frontend/src/styles/effects.css`

**Step 1: 添加侧边栏装饰样式**

Append to `frontend/src/styles/effects.css`:
```css
/* ----------------------------------------
   Sidebar Decorations
   ---------------------------------------- */

/* Sidebar header glow */
.sidebar-header-glow {
  position: relative;
}

.sidebar-header-glow::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 60px;
  background: radial-gradient(ellipse, rgba(24, 144, 255, 0.15), transparent);
  filter: blur(20px);
  pointer-events: none;
}

/* Active connection indicator */
.connection-active-indicator {
  position: relative;
}

.connection-active-indicator::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: linear-gradient(180deg, #1890ff, #722ed1);
  border-radius: 0 2px 2px 0;
}

/* Sidebar collapse animation */
.sidebar-collapsing {
  transform-origin: left center;
  animation: sidebar-flip 400ms ease-out forwards;
}

.sidebar-expanding {
  transform-origin: left center;
  animation: sidebar-flip-in 400ms ease-out forwards;
}
```

**Step 2: Commit**

```bash
git add frontend/src/styles/effects.css
git commit -m "feat: add sidebar decoration styles"
```

---

### Task 15: 添加自定义滚动条样式

**Files:**
- Modify: `frontend/src/styles/effects.css`

**Step 1: 添加滚动条样式**

Append to `frontend/src/styles/effects.css`:
```css
/* ----------------------------------------
   Custom Scrollbar
   ---------------------------------------- */

/* Webkit browsers */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

/* Thin scrollbar variant */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

/* Hide scrollbar but keep functionality */
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
```

**Step 2: Commit**

```bash
git add frontend/src/styles/effects.css
git commit -m "feat: add custom scrollbar styles"
```

---

### Task 16: 添加 Modal 3D 动画样式

**Files:**
- Modify: `frontend/src/styles/effects.css`

**Step 1: 添加 Modal 动画样式**

Append to `frontend/src/styles/effects.css`:
```css
/* ----------------------------------------
   Modal 3D Animations
   ---------------------------------------- */

.modal-3d-enter .ant-modal-content {
  animation: modal-fly-in 350ms ease-out forwards;
}

.modal-3d-exit .ant-modal-content {
  animation: modal-fly-out 250ms ease-in forwards;
}

/* Modal mask fade */
.modal-3d-enter .ant-modal-mask {
  animation: fadeIn 350ms ease-out;
}

.modal-3d-exit .ant-modal-mask {
  animation: fadeOut 250ms ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

**Step 2: Commit**

```bash
git add frontend/src/styles/effects.css
git commit -m "feat: add Modal 3D animation styles"
```

---

## P4: 2D 特效

### Task 17: 实现 ParticleBackground 粒子背景

**Files:**
- Create: `frontend/src/components/effects/ParticleBackground.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 ParticleBackground 组件**

Create `frontend/src/components/effects/ParticleBackground.tsx`:
```tsx
import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  particleColor?: string;
  lineColor?: string;
  maxDistance?: number;
  className?: string;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  particleCount = 50,
  particleColor = 'rgba(148, 163, 184, 0.5)',
  lineColor = 'rgba(148, 163, 184, 0.15)',
  maxDistance = 100,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    const initParticles = () => {
      particlesRef.current = Array(particleCount)
        .fill(0)
        .map(() => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
        }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);

          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = lineColor.replace(
              /[\d.]+\)$/,
              `${0.15 * (1 - dist / maxDistance)})`
            );
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    const observer = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      observer.disconnect();
    };
  }, [particleCount, particleColor, lineColor, maxDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-background ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default ParticleBackground;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
export { useFlashEffect } from './useFlashEffect';
export { Skeleton, TableSkeleton, TreeSkeleton } from './Skeleton';
export { StatusDot } from './StatusDot';
export { ProgressBar } from './ProgressBar';
export { EmptyState } from './EmptyState';
export { ParticleBackground } from './ParticleBackground';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/ParticleBackground.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add ParticleBackground canvas component"
```

---

### Task 18: 实现 DataFlow 数据流动画

**Files:**
- Create: `frontend/src/components/effects/DataFlow.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 DataFlow 组件**

Create `frontend/src/components/effects/DataFlow.tsx`:
```tsx
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

      {/* Flow path */}
      <path
        id="flowPath"
        d={`M 0,${height / 2} Q ${width / 4},${height * 0.2} ${width / 2},${height / 2} T ${width},${height / 2}`}
        fill="none"
        stroke="url(#flowGradient)"
        strokeWidth="2"
        strokeDasharray="8 4"
        opacity="0.3"
      />

      {/* Animated particles */}
      {Array(particleCount)
        .fill(0)
        .map((_, i) => (
          <circle key={i} r="3" fill={color}>
            <animateMotion
              dur="1.2s"
              repeatCount="indefinite"
              begin={`${i * (1.2 / particleCount)}s`}
            >
              <mpath href="#flowPath" />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="1.2s"
              repeatCount="indefinite"
              begin={`${i * (1.2 / particleCount)}s`}
            />
          </circle>
        ))}
    </svg>
  );
};

export default DataFlow;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
export { useFlashEffect } from './useFlashEffect';
export { Skeleton, TableSkeleton, TreeSkeleton } from './Skeleton';
export { StatusDot } from './StatusDot';
export { ProgressBar } from './ProgressBar';
export { EmptyState } from './EmptyState';
export { ParticleBackground } from './ParticleBackground';
export { DataFlow } from './DataFlow';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/DataFlow.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add DataFlow SVG animation component"
```

---

### Task 19: 实现 WaveDivider 波浪分隔线

**Files:**
- Create: `frontend/src/components/effects/WaveDivider.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 WaveDivider 组件**

Create `frontend/src/components/effects/WaveDivider.tsx`:
```tsx
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
      style={{
        width: '100%',
        height,
        opacity: 0.5,
        display: 'block',
      }}
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M0,5 Q25,0 50,5 T100,5"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="0.5"
      >
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
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
export { useFlashEffect } from './useFlashEffect';
export { Skeleton, TableSkeleton, TreeSkeleton } from './Skeleton';
export { StatusDot } from './StatusDot';
export { ProgressBar } from './ProgressBar';
export { EmptyState } from './EmptyState';
export { ParticleBackground } from './ParticleBackground';
export { DataFlow } from './DataFlow';
export { WaveDivider } from './WaveDivider';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/WaveDivider.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add WaveDivider animated SVG component"
```

---

## P5: 3D 基础特效

### Task 20: 实现 TiltCard 卡片倾斜组件

**Files:**
- Create: `frontend/src/components/effects/TiltCard.tsx`
- Modify: `frontend/src/components/effects/index.ts`

**Step 1: 创建 TiltCard 组件**

Create `frontend/src/components/effects/TiltCard.tsx`:
```tsx
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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      element.style.transform = `
        perspective(${perspective}px)
        rotateY(${x * maxTilt}deg)
        rotateX(${-y * maxTilt}deg)
        scale3d(${scale}, ${scale}, ${scale})
      `;
    },
    [maxTilt, scale, perspective]
  );

  const handleMouseLeave = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    element.style.transform = `
      perspective(${perspective}px)
      rotateY(0deg)
      rotateX(0deg)
      scale3d(1, 1, 1)
    `;
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
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/effects/index.ts`:
```typescript
export { Ripple } from './Ripple';
export { RippleButton } from './RippleButton';
export { useFlashEffect } from './useFlashEffect';
export { Skeleton, TableSkeleton, TreeSkeleton } from './Skeleton';
export { StatusDot } from './StatusDot';
export { ProgressBar } from './ProgressBar';
export { EmptyState } from './EmptyState';
export { ParticleBackground } from './ParticleBackground';
export { DataFlow } from './DataFlow';
export { WaveDivider } from './WaveDivider';
export { TiltCard } from './TiltCard';
```

**Step 3: Commit**

```bash
git add frontend/src/components/effects/TiltCard.tsx frontend/src/components/effects/index.ts
git commit -m "feat: add TiltCard 3D hover effect component"
```

---

## P6: 3D 太空拓扑图

### Task 21: 创建 StarField 星空背景

**Files:**
- Create: `frontend/src/components/topology/StarField.tsx`
- Modify: `frontend/src/components/topology/index.ts`

**Step 1: 创建 StarField 组件**

Create `frontend/src/components/topology/StarField.tsx`:
```tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
}

export const StarField: React.FC<StarFieldProps> = ({ count = 2000 }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 50 + Math.random() * 100;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Color variation: white/blue/purple
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        // White
        col[i * 3] = 0.9;
        col[i * 3 + 1] = 0.95;
        col[i * 3 + 2] = 1;
      } else if (colorChoice < 0.85) {
        // Blue
        col[i * 3] = 0.5;
        col[i * 3 + 1] = 0.7;
        col[i * 3 + 2] = 1;
      } else {
        // Purple
        col[i * 3] = 0.8;
        col[i * 3 + 1] = 0.5;
        col[i * 3 + 2] = 1;
      }
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

export default StarField;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/topology/index.ts`:
```typescript
export { StarField } from './StarField';
```

**Step 3: Commit**

```bash
git add frontend/src/components/topology/StarField.tsx frontend/src/components/topology/index.ts
git commit -m "feat: add StarField 3D background component"
```

---

### Task 22: 创建 CentralNode 中心节点

**Files:**
- Create: `frontend/src/components/topology/CentralNode.tsx`
- Modify: `frontend/src/components/topology/index.ts`

**Step 1: 创建 CentralNode 组件**

Create `frontend/src/components/topology/CentralNode.tsx`:
```tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

export const CentralNode: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core sphere */}
      <Sphere args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color="#1890ff"
          emissive="#1890ff"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Glow layer */}
      <Sphere ref={glowRef} args={[1.8, 32, 32]}>
        <meshBasicMaterial color="#1890ff" transparent opacity={0.15} />
      </Sphere>

      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.03, 16, 64]} />
        <meshBasicMaterial color="#1890ff" transparent opacity={0.4} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -2.8, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        GoNavi
      </Text>
    </group>
  );
};

export default CentralNode;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/topology/index.ts`:
```typescript
export { StarField } from './StarField';
export { CentralNode } from './CentralNode';
```

**Step 3: Commit**

```bash
git add frontend/src/components/topology/CentralNode.tsx frontend/src/components/topology/index.ts
git commit -m "feat: add CentralNode 3D component"
```

---

### Task 23: 创建 OrbitLine 轨道线

**Files:**
- Create: `frontend/src/components/topology/OrbitLine.tsx`
- Modify: `frontend/src/components/topology/index.ts`

**Step 1: 创建 OrbitLine 组件**

Create `frontend/src/components/topology/OrbitLine.tsx`:
```tsx
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitLineProps {
  radius: number;
  color?: string;
  active?: boolean;
}

export const OrbitLine: React.FC<OrbitLineProps> = ({
  radius,
  color = '#334155',
  active = false,
}) => {
  const lineRef = useRef<THREE.Line>(null);

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(
        new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  useFrame((state) => {
    if (active && lineRef.current) {
      const material = lineRef.current.material as THREE.LineDashedMaterial;
      material.dashOffset = -state.clock.elapsedTime * 2;
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineDashedMaterial
        color={active ? '#1890ff' : color}
        dashSize={active ? 0.5 : 1000}
        gapSize={active ? 0.3 : 0}
        transparent
        opacity={active ? 0.8 : 0.3}
      />
    </line>
  );
};

export default OrbitLine;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/topology/index.ts`:
```typescript
export { StarField } from './StarField';
export { CentralNode } from './CentralNode';
export { OrbitLine } from './OrbitLine';
```

**Step 3: Commit**

```bash
git add frontend/src/components/topology/OrbitLine.tsx frontend/src/components/topology/index.ts
git commit -m "feat: add OrbitLine 3D component"
```

---

### Task 24: 创建 PlanetNode 星球节点

**Files:**
- Create: `frontend/src/components/topology/PlanetNode.tsx`
- Modify: `frontend/src/components/topology/index.ts`

**Step 1: 创建 PlanetNode 组件**

Create `frontend/src/components/topology/PlanetNode.tsx`:
```tsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SavedConnection } from '../../types';

interface PlanetNodeProps {
  connection: SavedConnection;
  orbitRadius: number;
  orbitSpeed: number;
  isActive: boolean;
  onSelect: () => void;
}

const DB_COLORS: Record<string, string> = {
  mysql: '#00758F',
  postgresql: '#336791',
  sqlite: '#003B57',
  default: '#722ed1',
};

export const PlanetNode: React.FC<PlanetNodeProps> = ({
  connection,
  orbitRadius,
  orbitSpeed,
  isActive,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  const color = DB_COLORS[connection.driver] || DB_COLORS.default;

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Orbital motion
      angleRef.current += orbitSpeed * delta;
      groupRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      groupRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;

      // Self rotation
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planet body */}
      <Sphere
        args={[0.6, 24, 24]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.8 : hovered ? 0.5 : 0.2}
          metalness={0.6}
          roughness={0.3}
        />
      </Sphere>

      {/* Ring for active connection */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.05, 16, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Hover tooltip */}
      {(hovered || isActive) && (
        <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div className="planet-tooltip">
            <strong>{connection.name}</strong>
            <span>
              {connection.driver}://{connection.host}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};

export default PlanetNode;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/topology/index.ts`:
```typescript
export { StarField } from './StarField';
export { CentralNode } from './CentralNode';
export { OrbitLine } from './OrbitLine';
export { PlanetNode } from './PlanetNode';
```

**Step 3: Commit**

```bash
git add frontend/src/components/topology/PlanetNode.tsx frontend/src/components/topology/index.ts
git commit -m "feat: add PlanetNode 3D component for connections"
```

---

### Task 25: 创建 SpaceScene 主场景

**Files:**
- Create: `frontend/src/components/topology/SpaceScene.tsx`
- Modify: `frontend/src/components/topology/index.ts`

**Step 1: 创建 SpaceScene 组件**

Create `frontend/src/components/topology/SpaceScene.tsx`:
```tsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { StarField } from './StarField';
import { CentralNode } from './CentralNode';
import { PlanetNode } from './PlanetNode';
import { OrbitLine } from './OrbitLine';
import { useStore } from '../../store';

const LoadingFallback: React.FC = () => (
  <mesh>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshBasicMaterial color="#1890ff" wireframe />
  </mesh>
);

export const SpaceScene: React.FC = () => {
  const { connections, activeContext } = useStore();

  const handleSelectConnection = (connectionId: string) => {
    // TODO: Integrate with store to select connection
    console.log('Selected connection:', connectionId);
  };

  return (
    <div className="topology-canvas" style={{ width: '100%', height: '100%' }}>
      <Canvas
        style={{
          background:
            'radial-gradient(ellipse at center, #0a0a1a 0%, #000008 100%)',
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={50}
          autoRotate
          autoRotateSpeed={0.3}
        />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#722ed1" />

        <Suspense fallback={<LoadingFallback />}>
          {/* Star field background */}
          <StarField count={2000} />

          {/* Central node */}
          <CentralNode />

          {/* Connection planets */}
          {connections.map((conn, i) => {
            const orbitRadius = 6 + i * 2.5;
            const isActive = activeContext?.connectionId === conn.id;

            return (
              <group key={conn.id}>
                <OrbitLine radius={orbitRadius} active={isActive} />
                <PlanetNode
                  connection={conn}
                  orbitRadius={orbitRadius}
                  orbitSpeed={0.2 / (i + 1)}
                  isActive={isActive}
                  onSelect={() => handleSelectConnection(conn.id)}
                />
              </group>
            );
          })}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SpaceScene;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/topology/index.ts`:
```typescript
export { StarField } from './StarField';
export { CentralNode } from './CentralNode';
export { OrbitLine } from './OrbitLine';
export { PlanetNode } from './PlanetNode';
export { SpaceScene } from './SpaceScene';
```

**Step 3: Commit**

```bash
git add frontend/src/components/topology/SpaceScene.tsx frontend/src/components/topology/index.ts
git commit -m "feat: add SpaceScene main 3D canvas component"
```

---

### Task 26: 创建 TopologyView 视图切换容器

**Files:**
- Create: `frontend/src/components/topology/TopologyView.tsx`
- Modify: `frontend/src/components/topology/index.ts`

**Step 1: 创建 TopologyView 组件**

Create `frontend/src/components/topology/TopologyView.tsx`:
```tsx
import React, { useState, Suspense } from 'react';
import { Button, Tooltip, Spin } from 'antd';
import { ApartmentOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { SpaceScene } from './SpaceScene';
import Sidebar from '../Sidebar';
import { SavedConnection } from '../../types';

type ViewMode = 'tree' | 'topology';

interface TopologyViewProps {
  onEditConnection: (conn: SavedConnection) => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  onEditConnection,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* View toggle buttons */}
      <div className="view-toggle">
        <Tooltip title="列表视图">
          <Button
            type={viewMode === 'tree' ? 'primary' : 'text'}
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode('tree')}
            size="small"
          />
        </Tooltip>
        <Tooltip title="3D 拓扑视图">
          <Button
            type={viewMode === 'topology' ? 'primary' : 'text'}
            icon={<ApartmentOutlined />}
            onClick={() => setViewMode('topology')}
            size="small"
          />
        </Tooltip>
      </div>

      {/* View content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {viewMode === 'tree' ? (
          <Sidebar onEditConnection={onEditConnection} />
        ) : (
          <Suspense
            fallback={
              <div className="topology-loading">
                <Spin tip="加载 3D 场景..." />
              </div>
            }
          >
            <SpaceScene />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default TopologyView;
```

**Step 2: 更新 index 导出**

Modify `frontend/src/components/topology/index.ts`:
```typescript
export { StarField } from './StarField';
export { CentralNode } from './CentralNode';
export { OrbitLine } from './OrbitLine';
export { PlanetNode } from './PlanetNode';
export { SpaceScene } from './SpaceScene';
export { TopologyView } from './TopologyView';
```

**Step 3: Commit**

```bash
git add frontend/src/components/topology/TopologyView.tsx frontend/src/components/topology/index.ts
git commit -m "feat: add TopologyView container with view mode toggle"
```

---

### Task 27: 集成 TopologyView 到 App

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: 导入并替换侧边栏**

Modify `frontend/src/App.tsx`:

1. 添加导入:
```typescript
import { TopologyView } from './components/topology';
```

2. 找到 Sidebar 的使用位置，替换为 TopologyView:

将:
```tsx
<div style={{ flex: 1, overflow: 'hidden' }}>
    <Sidebar onEditConnection={handleEditConnection} />
</div>
```

替换为:
```tsx
<div style={{ flex: 1, overflow: 'hidden' }}>
    <TopologyView onEditConnection={handleEditConnection} />
</div>
```

**Step 2: 验证构建**

Run:
```bash
cd /Users/zhangjinhui/Desktop/NaviDog/frontend && npm run build
```
Expected: 构建成功

**Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: integrate TopologyView into main App"
```

---

### Task 28: 最终验证与清理

**Step 1: 运行完整构建**

Run:
```bash
cd /Users/zhangjinhui/Desktop/NaviDog/frontend && npm run build
```
Expected: 构建成功无错误

**Step 2: 运行开发模式验证**

Run:
```bash
cd /Users/zhangjinhui/Desktop/NaviDog && wails dev
```
Expected: 应用启动，可以切换视图模式，3D 场景正常渲染

**Step 3: 创建功能完成标签**

Run:
```bash
git tag -a v0.1.0-ui-effects -m "UI effects and 3D topology view implementation"
```

**Step 4: 最终 Commit (如有遗漏)**

```bash
git status
# 如有未提交的更改
git add -A
git commit -m "chore: final cleanup for UI effects implementation"
```

---

## 附录：组件使用示例

### 使用 Ripple 效果
```tsx
import { RippleButton } from './components/effects';

<RippleButton type="primary" onClick={handleClick}>
  点击我
</RippleButton>
```

### 使用闪烁反馈
```tsx
import { useFlashEffect } from './components/effects';

const { ref, triggerFlash } = useFlashEffect();

const handleSave = async () => {
  try {
    await save();
    triggerFlash('success');
  } catch {
    triggerFlash('error');
  }
};

<div ref={ref}>结果区域</div>
```

### 使用骨架屏
```tsx
import { TableSkeleton } from './components/effects';

{loading ? <TableSkeleton rows={5} cols={4} /> : <DataTable data={data} />}
```

### 使用状态指示器
```tsx
import { StatusDot } from './components/effects';

<StatusDot status={isConnected ? 'connected' : 'disconnected'} />
```

---

## 验收清单

- [ ] 依赖安装成功
- [ ] 所有特效组件创建完成
- [ ] CSS 动画样式正常工作
- [ ] 3D 太空拓扑图正常渲染
- [ ] 视图切换流畅无闪烁
- [ ] 暗黑模式下效果正常
- [ ] 无 TypeScript 类型错误
- [ ] 无控制台错误
- [ ] 构建成功
