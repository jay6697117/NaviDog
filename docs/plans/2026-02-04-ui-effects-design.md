# GoNavi 前端 UI 特效优化设计

> 创建日期: 2026-02-04
> 状态: 待实施

## 1. 概述与架构

### 1.1 项目目标
为 GoNavi 数据库管理工具增加现代化 2D/3D 视觉特效，提升用户体验和产品质感，同时保持工具的专业性和高性能。

### 1.2 技术选型
| 类别 | 技术方案 |
|-----|---------|
| 3D 渲染 | React Three Fiber + Three.js |
| 2D 动画 | CSS Animations + Lottie |
| 粒子效果 | Canvas 2D / Three.js Points |
| 状态管理 | 复用现有 Zustand |

### 1.3 新增依赖
```json
{
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.88.0",
  "three": "^0.160.0",
  "@types/three": "^0.160.0",
  "lottie-react": "^2.4.0"
}
```

### 1.4 文件结构
```
frontend/src/
├── components/
│   ├── effects/           # 新增：特效组件
│   │   ├── Ripple.tsx
│   │   ├── Skeleton.tsx
│   │   ├── DataFlow.tsx
│   │   ├── ParticleBackground.tsx
│   │   ├── WaveDivider.tsx
│   │   └── TiltCard.tsx
│   ├── topology/          # 新增：3D拓扑
│   │   ├── TopologyView.tsx
│   │   ├── SpaceScene.tsx
│   │   ├── StarField.tsx
│   │   ├── CentralNode.tsx
│   │   ├── PlanetNode.tsx
│   │   ├── MoonNode.tsx
│   │   └── OrbitLine.tsx
│   └── Sidebar.tsx        # 修改：增加视图切换
├── styles/
│   ├── effects.css        # 新增：特效样式
│   └── topology.css       # 新增：拓扑样式
└── assets/
    └── lottie/            # 新增：Lottie 动画文件
        ├── success.json
        ├── loading.json
        └── database.json
```

---

## 2. 交互反馈特效

### 2.1 按钮涟漪效果 (Ripple)
```css
.ripple-button {
  position: relative;
  overflow: hidden;
}
.ripple-button::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  transform: scale(0);
  animation: ripple 600ms ease-out;
}
@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}
```
**应用范围：** 工具栏按钮、侧边栏操作按钮

### 2.2 树节点 Stagger 展开
```css
.tree-node-enter {
  opacity: 0;
  transform: translateX(-10px);
}
.tree-node-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 200ms var(--motion-ease-out);
  transition-delay: calc(var(--index) * 30ms);
}
```
**效果：** 子节点依次滑入，而非瞬间出现

### 2.3 操作反馈闪烁
```css
@keyframes success-flash {
  0%, 100% { box-shadow: inset 0 0 0 2px transparent; }
  50% { box-shadow: inset 0 0 0 2px #52c41a; }
}
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
```
**触发：** SQL 执行成功/失败时应用于结果区域

### 2.4 拖拽高亮
```css
.dragging-item {
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(24, 144, 255, 0.4);
  z-index: 1000;
}
.drop-indicator {
  height: 2px;
  background: linear-gradient(90deg, transparent, #1890ff, transparent);
}
```

---

## 3. 数据可视化

### 3.1 查询结果统计条
```tsx
// components/QueryStats.tsx
<div className="query-stats-bar">
  <span className="stat-item">
    <Icon type="row" /> {rowCount} 行
  </span>
  <span className="stat-item">
    <Icon type="column" /> {colCount} 列
  </span>
  <span className="stat-item">
    <Icon type="clock" /> {duration}ms
  </span>
  <MiniPieChart data={columnTypes} />
</div>
```
**样式：** 渐变背景条，紧凑布局，不超过 32px 高度

### 3.2 连接状态指示器
```css
/* 呼吸动画 - 活跃连接 */
@keyframes pulse-alive {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}
.status-dot.connected {
  background: #52c41a;
  animation: pulse-alive 2s ease-in-out infinite;
}
.status-dot.connecting {
  border: 2px solid #1890ff;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}
.status-dot.disconnected {
  background: #8c8c8c;
}
```

### 3.3 SQL 执行时间轴
```tsx
// components/LogPanel 增强
<div className="sql-timeline">
  {logs.map(log => (
    <div
      className={`timeline-node ${log.duration > 1000 ? 'slow' : ''}`}
      style={{ '--hue': durationToHue(log.duration) }}
    >
      <span className="time">{log.time}</span>
      <span className="duration">{log.duration}ms</span>
      <Collapse>{log.sql}</Collapse>
    </div>
  ))}
</div>
```
**高亮规则：** >1000ms 红色, >500ms 橙色, 其他绿色

### 3.4 列宽热力图
```tsx
// DataGrid 单元格增强
const bgOpacity = Math.min(content.length / 100, 0.15);
<td style={{
  background: `rgba(24, 144, 255, ${bgOpacity})`
}}>
```
**效果：** 内容越长背景越深，极淡不影响阅读

---

## 4. 氛围装饰特效

### 4.1 Glassmorphism 毛玻璃
```css
.glass-modal {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: var(--shadow-2);
}
[data-theme='dark'] .glass-modal {
  background: rgba(20, 24, 33, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```
**应用：** ConnectionModal, DataSyncModal, 下拉菜单

### 4.2 侧边栏渐变光晕
```css
.sidebar-header {
  position: relative;
}
.sidebar-header::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  width: 120px;
  height: 60px;
  background: radial-gradient(ellipse, rgba(24,144,255,0.15), transparent);
  filter: blur(20px);
  pointer-events: none;
}
.connection-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: linear-gradient(180deg, #1890ff, #722ed1);
  border-radius: 0 2px 2px 0;
}
```

### 4.3 标签页切换过渡
```css
.tab-content-enter {
  opacity: 0;
  transform: translateY(8px);
}
.tab-content-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms var(--motion-ease-out);
}
.tab-closing {
  animation: tab-close 200ms ease-out forwards;
}
@keyframes tab-close {
  to { opacity: 0; transform: scale(0.95) translateY(-10px); }
}
```

### 4.4 主题切换圆形扩散
```tsx
const toggleTheme = (e: React.MouseEvent) => {
  const x = e.clientX, y = e.clientY;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
    { duration: 500, easing: 'ease-out', pseudoElement: '::view-transition-new(root)' }
  );
  toggleDarkMode();
};
```

### 4.5 自定义滚动条
```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
```

---

## 5. 状态指示特效

### 5.1 骨架屏 Skeleton
```tsx
// components/effects/Skeleton.tsx
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="skeleton-table">
    <div className="skeleton-header">
      {Array(cols).fill(0).map((_, i) => (
        <div key={i} className="skeleton-cell shimmer" />
      ))}
    </div>
    {Array(rows).fill(0).map((_, r) => (
      <div key={r} className="skeleton-row">
        {Array(cols).fill(0).map((_, c) => (
          <div key={c} className="skeleton-cell shimmer" />
        ))}
      </div>
    ))}
  </div>
);
```
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-bg-layout) 25%,
    var(--color-surface-hover) 50%,
    var(--color-bg-layout) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 5.2 SQL 执行进度指示
```css
.tab-executing::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1890ff;
  animation: pulse-dot 1s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

/* 顶部进度条 */
.query-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #1890ff, #722ed1);
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}
@keyframes progress-indeterminate {
  0% { left: -30%; width: 30%; }
  50% { left: 50%; width: 30%; }
  100% { left: 100%; width: 30%; }
}
```

### 5.3 连接心跳动画
```css
.connection-heartbeat {
  animation: heartbeat 3s ease-in-out infinite;
}
@keyframes heartbeat {
  0%, 90%, 100% { transform: scale(1); }
  95% { transform: scale(1.15); }
}
```

### 5.4 数据操作过渡
```css
/* 保存成功 */
@keyframes cell-saved {
  0% { background: rgba(82, 196, 26, 0.3); }
  100% { background: transparent; }
}
.cell-just-saved { animation: cell-saved 800ms ease-out; }

/* 删除行 */
@keyframes row-delete {
  to { opacity: 0; transform: translateX(-100%); height: 0; }
}
.row-deleting { animation: row-delete 300ms ease-out forwards; }

/* 新增行 */
@keyframes row-insert {
  from { opacity: 0; transform: translateY(20px); background: rgba(24,144,255,0.1); }
  to { opacity: 1; transform: translateY(0); background: transparent; }
}
.row-inserted { animation: row-insert 400ms ease-out; }
```

### 5.5 空状态引导动画
```css
.empty-state-icon {
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.empty-state-cta {
  animation: pulse-glow 2s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(24,144,255,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(24,144,255,0); }
}
```

---

## 6. 2D 特效

### 6.1 数据流动画
```tsx
// components/effects/DataFlow.tsx
export const DataFlow = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <svg className="data-flow-svg">
      <path id="flow-path" d="M 0,50 Q 100,0 200,50" fill="none" />
      {[0, 1, 2, 3, 4].map(i => (
        <circle key={i} r="3" fill="#1890ff">
          <animateMotion
            dur="1s"
            repeatCount="indefinite"
            begin={`${i * 0.2}s`}
          >
            <mpath href="#flow-path" />
          </animateMotion>
        </circle>
      ))}
    </svg>
  );
};
```
```css
.data-flow-svg {
  position: absolute;
  pointer-events: none;
  z-index: 100;
  filter: drop-shadow(0 0 4px rgba(24,144,255,0.6));
}
```

### 6.2 Canvas 粒子背景
```tsx
// components/effects/ParticleBackground.tsx
export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const particles: Particle[] = Array(50).fill(0).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(148,163,184,${0.2 * (1 - dist/100)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} className="particle-bg" />;
};
```
**应用位置：** 空状态区域、暗黑模式下的欢迎页

### 6.3 Lottie 动画图标
```tsx
import Lottie from 'lottie-react';
import successAnim from '../assets/lottie/success.json';
import loadingAnim from '../assets/lottie/database-loading.json';

<Lottie animationData={successAnim} loop={false} style={{ width: 48 }} />
<Lottie animationData={loadingAnim} loop={true} style={{ width: 32 }} />
```
**推荐动画资源：** LottieFiles.com 搜索 database / success / loading

### 6.4 波浪分隔线
```tsx
// components/effects/WaveDivider.tsx
export const WaveDivider = () => (
  <svg className="wave-divider" viewBox="0 0 100 10" preserveAspectRatio="none">
    <path
      d="M0,5 Q25,0 50,5 T100,5"
      fill="none"
      stroke="url(#wave-gradient)"
      strokeWidth="0.5"
    >
      <animate
        attributeName="d"
        values="M0,5 Q25,0 50,5 T100,5; M0,5 Q25,10 50,5 T100,5; M0,5 Q25,0 50,5 T100,5"
        dur="4s"
        repeatCount="indefinite"
      />
    </path>
    <defs>
      <linearGradient id="wave-gradient">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="50%" stopColor="#1890ff" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
  </svg>
);
```

---

## 7. 3D 特效

### 7.1 卡片倾斜效果 (Tilt)
```tsx
// components/effects/TiltCard.tsx
export const TiltCard = ({ children }: PropsWithChildren) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current!.style.transform = `
      perspective(1000px)
      rotateY(${x * 10}deg)
      rotateX(${-y * 10}deg)
      scale3d(1.02, 1.02, 1.02)
    `;
  };

  const handleMouseLeave = () => {
    ref.current!.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
  };

  return (
    <div
      ref={ref}
      className="tilt-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};
```
```css
.tilt-card {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
  transform-style: preserve-3d;
}
.tilt-card:hover {
  box-shadow:
    0 20px 40px rgba(0,0,0,0.15),
    0 0 30px rgba(24,144,255,0.1);
}
```

### 7.2 标签页 3D 堆叠预览
```tsx
// components/TabStackPreview.tsx
export const TabStackPreview = ({ tabs }: { tabs: Tab[] }) => (
  <div className="tab-stack-3d">
    {tabs.slice(0, 5).map((tab, i) => (
      <div
        key={tab.id}
        className="stacked-tab"
        style={{
          transform: `
            translateZ(${-i * 20}px)
            translateY(${i * 4}px)
            rotateX(${i * 2}deg)
          `,
          opacity: 1 - i * 0.15
        }}
      >
        {tab.title}
      </div>
    ))}
  </div>
);
```
```css
.tab-stack-3d {
  perspective: 800px;
  transform-style: preserve-3d;
}
.stacked-tab {
  position: absolute;
  transition: transform 200ms ease-out;
}
.tab-stack-3d:hover .stacked-tab {
  transform: translateZ(0) translateY(0) rotateX(0) !important;
}
```

### 7.3 侧边栏折叠 3D 翻转
```css
.sidebar-collapsing {
  transform-origin: left center;
  animation: sidebar-flip 400ms ease-out forwards;
}
@keyframes sidebar-flip {
  0% { transform: perspective(1000px) rotateY(0); opacity: 1; }
  100% { transform: perspective(1000px) rotateY(-90deg); opacity: 0; width: 0; }
}
.sidebar-expanding {
  transform-origin: left center;
  animation: sidebar-flip-in 400ms ease-out forwards;
}
@keyframes sidebar-flip-in {
  0% { transform: perspective(1000px) rotateY(-90deg); opacity: 0; }
  100% { transform: perspective(1000px) rotateY(0); opacity: 1; }
}
```

### 7.4 Modal 3D 弹出
```css
.modal-3d-enter {
  animation: modal-fly-in 350ms ease-out forwards;
}
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
.modal-3d-exit {
  animation: modal-fly-out 250ms ease-in forwards;
}
@keyframes modal-fly-out {
  to {
    transform: perspective(1000px) translateZ(-200px) rotateX(-10deg);
    opacity: 0;
  }
}
```

---

## 8. 3D 太空拓扑图（核心功能）

### 8.1 设计理念
- **视觉风格：** 太空风 - 星空背景，节点如星球悬浮，连接如星轨流动
- **展示位置：** 侧边栏视图模式切换（树形视图 / 3D 拓扑视图）
- **交互映射：**
  - 展开连接 → 点击星球节点 → 数据库卫星飞出环绕
  - 展开数据库 → 再点击 → 表节点继续展开
  - 选中表 → 点击表节点 → 右侧打开表数据
  - 右键菜单 → 右键节点 → 同样弹出操作菜单
  - 搜索过滤 → 匹配节点高亮发光，其他变暗

### 8.2 文件结构
```
topology/
├── TopologyView.tsx      # 主容器，视图切换入口
├── SpaceScene.tsx        # Three.js 场景容器
├── StarField.tsx         # 星空背景
├── CentralNode.tsx       # 中心 GoNavi Logo 节点
├── PlanetNode.tsx        # 数据库连接星球
├── MoonNode.tsx          # 数据库/表 卫星
├── OrbitLine.tsx         # 轨道连接线
└── useTopologyStore.ts   # 拓扑状态管理
```

### 8.3 星空背景 (StarField)
```tsx
// components/topology/StarField.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const StarField = ({ count = 2000 }) => {
  const points = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 球形分布
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 50 + Math.random() * 100;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // 颜色变化：白/蓝/紫
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        col[i * 3] = 0.9; col[i * 3 + 1] = 0.95; col[i * 3 + 2] = 1;
      } else if (colorChoice < 0.85) {
        col[i * 3] = 0.5; col[i * 3 + 1] = 0.7; col[i * 3 + 2] = 1;
      } else {
        col[i * 3] = 0.8; col[i * 3 + 1] = 0.5; col[i * 3 + 2] = 1;
      }
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.5} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};
```

### 8.4 中心节点 (CentralNode)
```tsx
// components/topology/CentralNode.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';

export const CentralNode = () => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 核心球体 */}
      <Sphere args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color="#1890ff"
          emissive="#1890ff"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* 发光层 */}
      <Sphere ref={glowRef} args={[1.8, 32, 32]}>
        <meshBasicMaterial
          color="#1890ff"
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* 标签 */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        GoNavi
      </Text>
    </group>
  );
};
```

### 8.5 星球节点 (PlanetNode)
```tsx
// components/topology/PlanetNode.tsx
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import { SavedConnection } from '../../types';

interface Props {
  connection: SavedConnection;
  position: [number, number, number];
  orbitRadius: number;
  orbitSpeed: number;
  isActive: boolean;
  onSelect: () => void;
}

const DB_COLORS = {
  mysql: '#00758F',
  postgresql: '#336791',
  sqlite: '#003B57',
  default: '#722ed1'
};

export const PlanetNode = ({
  connection,
  position,
  orbitRadius,
  orbitSpeed,
  isActive,
  onSelect
}: Props) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  const color = DB_COLORS[connection.driver] || DB_COLORS.default;

  useFrame((state, delta) => {
    if (groupRef.current) {
      // 轨道运动
      angleRef.current += orbitSpeed * delta;
      groupRef.current.position.x = Math.cos(angleRef.current) * orbitRadius;
      groupRef.current.position.z = Math.sin(angleRef.current) * orbitRadius;

      // 自转
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 星球本体 */}
      <Sphere
        args={[0.6, 24, 24]}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.8 : hovered ? 0.5 : 0.2}
          metalness={0.6}
          roughness={0.3}
        />
      </Sphere>

      {/* 光环 - 活跃连接 */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.05, 16, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      )}

      {/* 悬浮信息 */}
      {(hovered || isActive) && (
        <Html distanceFactor={10}>
          <div className="planet-tooltip">
            <strong>{connection.name}</strong>
            <span>{connection.driver}://{connection.host}</span>
          </div>
        </Html>
      )}
    </group>
  );
};
```

### 8.6 轨道连接线 (OrbitLine)
```tsx
// components/topology/OrbitLine.tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  radius: number;
  color?: string;
  active?: boolean;
}

export const OrbitLine = ({ radius, color = '#334155', active = false }: Props) => {
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }
    return pts;
  }, [radius]);

  useFrame((state) => {
    if (active && lineRef.current) {
      (lineRef.current.material as THREE.LineDashedMaterial).dashOffset =
        -state.clock.elapsedTime * 2;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
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
```

### 8.7 卫星节点 (MoonNode)
```tsx
// components/topology/MoonNode.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';

interface Props {
  name: string;
  type: 'database' | 'table';
  parentPosition: [number, number, number];
  orbitRadius: number;
  orbitSpeed: number;
  onSelect: () => void;
}

export const MoonNode = ({
  name,
  type,
  parentPosition,
  orbitRadius,
  orbitSpeed,
  onSelect
}: Props) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (meshRef.current) {
      angleRef.current += orbitSpeed * delta;
      meshRef.current.position.x = parentPosition[0] + Math.cos(angleRef.current) * orbitRadius;
      meshRef.current.position.y = parentPosition[1] + Math.sin(angleRef.current * 0.5) * 0.3;
      meshRef.current.position.z = parentPosition[2] + Math.sin(angleRef.current) * orbitRadius;
    }
  });

  const size = type === 'database' ? 0.25 : 0.15;
  const color = type === 'database' ? '#52c41a' : '#faad14';

  return (
    <Sphere ref={meshRef} args={[size, 16, 16]} onClick={onSelect}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
      />
    </Sphere>
  );
};
```

### 8.8 主场景容器 (SpaceScene)
```tsx
// components/topology/SpaceScene.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { StarField } from './StarField';
import { CentralNode } from './CentralNode';
import { PlanetNode } from './PlanetNode';
import { OrbitLine } from './OrbitLine';
import { useStore } from '../../store';

export const SpaceScene = () => {
  const { connections, activeContext } = useStore();

  return (
    <Canvas style={{ background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000008 100%)' }}>
      <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
      <OrbitControls
        enablePan={false}
        minDistance={10}
        maxDistance={50}
        autoRotate
        autoRotateSpeed={0.3}
      />

      {/* 光照 */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#722ed1" />

      {/* 星空背景 */}
      <StarField count={2000} />

      {/* 中心节点 */}
      <CentralNode />

      {/* 连接星球 */}
      {connections.map((conn, i) => {
        const orbitRadius = 6 + i * 2.5;
        const isActive = activeContext?.connectionId === conn.id;

        return (
          <group key={conn.id}>
            <OrbitLine radius={orbitRadius} active={isActive} />
            <PlanetNode
              connection={conn}
              position={[orbitRadius, 0, 0]}
              orbitRadius={orbitRadius}
              orbitSpeed={0.2 / (i + 1)}
              isActive={isActive}
              onSelect={() => {/* 展开数据库 */}}
            />
          </group>
        );
      })}
    </Canvas>
  );
};
```

### 8.9 视图切换容器 (TopologyView)
```tsx
// components/topology/TopologyView.tsx
import { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { ApartmentOutlined, AppstoreOutlined } from '@ant-design/icons';
import { SpaceScene } from './SpaceScene';
import Sidebar from '../Sidebar';

type ViewMode = 'tree' | 'topology';

export const SidebarWithToggle = ({ onEditConnection }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 视图切换按钮 */}
      <div className="view-toggle">
        <Tooltip title="树形视图">
          <Button
            type={viewMode === 'tree' ? 'primary' : 'text'}
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode('tree')}
          />
        </Tooltip>
        <Tooltip title="3D 拓扑视图">
          <Button
            type={viewMode === 'topology' ? 'primary' : 'text'}
            icon={<ApartmentOutlined />}
            onClick={() => setViewMode('topology')}
          />
        </Tooltip>
      </div>

      {/* 视图内容 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {viewMode === 'tree' ? (
          <Sidebar onEditConnection={onEditConnection} />
        ) : (
          <SpaceScene />
        )}
      </div>
    </div>
  );
};
```

### 8.10 拓扑图样式
```css
/* styles/topology.css */
.view-toggle {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
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
}

.planet-tooltip strong {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.planet-tooltip span {
  color: rgba(255, 255, 255, 0.6);
}
```

---

## 9. 实施计划与优先级

### 9.1 阶段划分

| 阶段 | 内容 | 复杂度 | 预期效果 |
|-----|------|-------|---------|
| P0 | 交互反馈（涟漪、闪烁、骨架屏） | 低 | 立即提升手感 |
| P1 | 状态指示（进度条、心跳、过渡动画） | 低 | 提升状态感知 |
| P2 | 氛围装饰（毛玻璃、渐变、滚动条） | 中 | 提升质感 |
| P3 | 2D 特效（粒子、数据流、Lottie） | 中 | 增添活力 |
| P4 | 3D 特效（Tilt、Modal 弹出） | 中 | 现代感 |
| P5 | 3D 太空拓扑图 | 高 | 核心亮点 |

### 9.2 性能守则
1. 所有动画使用 `transform` / `opacity`，避免触发 layout
2. 3D 场景使用 `useMemo` 缓存几何体
3. 连接数 > 20 时自动简化拓扑图渲染
4. 尊重 `prefers-reduced-motion` 设置
5. Canvas 离屏时暂停渲染 (`useFrame` 内判断)

### 9.3 无障碍支持
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. 验收标准

- [ ] 所有交互反馈动画流畅无卡顿
- [ ] 骨架屏正确显示于加载状态
- [ ] 毛玻璃效果在暗黑/亮色模式下均正常
- [ ] 3D 拓扑图可正常渲染 20+ 连接
- [ ] 视图切换平滑无闪烁
- [ ] `prefers-reduced-motion` 用户体验正常
- [ ] 无内存泄漏（Canvas 组件正确销毁）
