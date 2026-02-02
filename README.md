# GoNavi - 现代化的轻量级数据库管理工具

![GoNavi Banner](https://socialify.git.ci/yangguofeng/GoNavi/image?description=1&font=Inter&language=1&name=1&owner=1&pattern=Circuit%20Board&theme=Auto)

[![Go Version](https://img.shields.io/github/go-mod/go-version/yangguofeng/GoNavi)](https://go.dev/)
[![Wails Version](https://img.shields.io/badge/Wails-v2-red)](https://wails.io)
[![React Version](https://img.shields.io/badge/React-v18-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yangguofeng/GoNavi/release.yml?label=Build)](https://github.com/yangguofeng/GoNavi/actions)

**GoNavi** 是一款基于 **Wails (Go)** 和 **React** 构建的现代化、高性能、跨平台数据库管理客户端。它旨在提供如原生应用般流畅的用户体验，同时保持极低的资源占用。

相比于 Electron 应用，GoNavi 的体积更小（~10MB），启动速度更快，内存占用更低。

---

## ✨ 核心特性

### 🚀 极致性能
- **零卡顿交互**：采用独创的 "幽灵拖拽" (Ghost Resizing) 技术，在包含数万行数据的表格中调整列宽，依然保持 60fps+ 的丝滑体验。
- **虚拟滚动**：轻松处理海量数据展示，拒绝卡顿。

### 🔌 多数据库支持
- **MySQL**：完整的支持，包括表结构设计、索引管理、外键管理等。
- **PostgreSQL**：基础支持（持续完善中）。
- **SQLite**：本地文件数据库支持。
- **SSH 隧道**：内置 SSH 隧道支持，安全连接内网数据库。

### 📊 强大的数据管理 (DataGrid)
- **所见即所得编辑**：直接在表格中双击单元格修改数据。
- **事务操作**：支持批量新增、修改、删除，一键提交或回滚事务。
- **智能上下文**：自动识别单表查询，解锁编辑功能；复杂查询自动切换为只读模式。
- **数据导出**：支持导出为 CSV, Excel (XLSX), JSON, Markdown 等格式。

### 📝 智能 SQL 编辑器
- **Monaco Editor 内核**：集成 VS Code 同款编辑器，体验极佳。
- **智能补全**：自动感知当前连接上下文，提供数据库、表名、字段名的实时补全。
- **多标签页**：支持多窗口并行操作，像浏览器一样管理你的查询会话。

### 🎨 现代化 UI
- **Ant Design 5**：企业级 UI 设计语言。
- **暗黑模式**：内置深色/浅色主题切换，适应不同光照环境。
- **响应式布局**：灵活的侧边栏与布局调整。

---

## 🛠️ 技术栈

*   **后端 (Backend)**: Go 1.24 + Wails v2
*   **前端 (Frontend)**: React 18 + TypeScript + Vite
*   **UI 框架**: Ant Design 5
*   **状态管理**: Zustand
*   **编辑器**: Monaco Editor

---

## 📦 安装与运行

### 前置要求
*   [Go](https://go.dev/dl/) 1.21+
*   [Node.js](https://nodejs.org/) 18+
*   [Wails CLI](https://wails.io/docs/gettingstarted/installation): `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### 开发模式

```bash
# 克隆项目
git clone https://github.com/yangguofeng/GoNavi.git
cd GoNavi

# 启动开发服务器 (支持热重载)
wails dev
```

### 编译构建

```bash
# 构建当前平台的可执行文件
wails build

# 清理并构建 (推荐发布前使用)
wails build -clean
```

构建产物将位于 `build/bin` 目录下。

### 跨平台编译 (GitHub Actions)

本项目内置了 GitHub Actions 流水线，Push `v*` 格式的 Tag 即可自动触发构建并发布 Release。
支持构建：
*   macOS (AMD64 / ARM64)
*   Windows (AMD64)

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1.  Fork 本仓库
2.  创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交你的改动 (`git commit -m 'feat: Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  开启一个 Pull Request

## 📄 开源协议

本项目采用 [Apache-2.0 协议](LICENSE) 开源。
