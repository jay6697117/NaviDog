import React, { useState, useEffect } from 'react';
import { Layout, Button, ConfigProvider, theme } from 'antd';
import { PlusOutlined, BulbOutlined, BulbFilled, ConsoleSqlOutlined, BugOutlined } from '@ant-design/icons';
import Sidebar from './components/Sidebar';
import TabManager from './components/TabManager';
import ConnectionModal from './components/ConnectionModal';
import LogPanel from './components/LogPanel';
import { useStore } from './store';
import { SavedConnection } from './types';
import './App.css';

const { Sider, Content } = Layout;

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<SavedConnection | null>(null);
  const { darkMode, toggleDarkMode, addTab, activeContext } = useStore();

  // Log Panel
  const [logPanelHeight, setLogPanelHeight] = useState(200);
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);
  const logResizeRef = React.useRef<{ startY: number, startHeight: number } | null>(null);
  const logGhostRef = React.useRef<HTMLDivElement>(null);

  const handleLogResizeStart = (e: React.MouseEvent) => {
      e.preventDefault();
      logResizeRef.current = { startY: e.clientY, startHeight: logPanelHeight };
      
      if (logGhostRef.current) {
          logGhostRef.current.style.top = `${e.clientY}px`;
          logGhostRef.current.style.display = 'block';
      }

      document.addEventListener('mousemove', handleLogResizeMove);
      document.addEventListener('mouseup', handleLogResizeUp);
  };

  const handleLogResizeMove = (e: MouseEvent) => {
      if (!logResizeRef.current) return;
      // Just update ghost line, no state update
      if (logGhostRef.current) {
          logGhostRef.current.style.top = `${e.clientY}px`;
      }
  };

  const handleLogResizeUp = (e: MouseEvent) => {
      if (logResizeRef.current) {
          const delta = logResizeRef.current.startY - e.clientY; 
          const newHeight = Math.max(100, Math.min(800, logResizeRef.current.startHeight + delta));
          setLogPanelHeight(newHeight);
      }
      
      if (logGhostRef.current) {
          logGhostRef.current.style.display = 'none';
      }

      logResizeRef.current = null;
      document.removeEventListener('mousemove', handleLogResizeMove);
      document.removeEventListener('mouseup', handleLogResizeUp);
  };
  
  const handleEditConnection = (conn: SavedConnection) => {
      setEditingConnection(conn);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingConnection(null);
  };
  
  // Sidebar Resizing
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const sidebarDragRef = React.useRef<{ startX: number, startWidth: number } | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const ghostRef = React.useRef<HTMLDivElement>(null);
  const latestMouseX = React.useRef<number>(0); // Store latest mouse position

  const handleSidebarMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      
      if (ghostRef.current) {
          ghostRef.current.style.left = `${sidebarWidth}px`;
          ghostRef.current.style.display = 'block';
      }
      
      sidebarDragRef.current = { startX: e.clientX, startWidth: sidebarWidth };
      latestMouseX.current = e.clientX; // Init
      document.addEventListener('mousemove', handleSidebarMouseMove);
      document.addEventListener('mouseup', handleSidebarMouseUp);
  };

  const handleSidebarMouseMove = (e: MouseEvent) => {
      if (!sidebarDragRef.current) return;
      
      latestMouseX.current = e.clientX; // Always update latest pos

      if (rafRef.current) return; // Schedule once per frame

      rafRef.current = requestAnimationFrame(() => {
          if (!sidebarDragRef.current || !ghostRef.current) return;
          // Use latestMouseX.current instead of stale closure 'e.clientX'
          const delta = latestMouseX.current - sidebarDragRef.current.startX;
          const newWidth = Math.max(200, Math.min(600, sidebarDragRef.current.startWidth + delta));
          ghostRef.current.style.left = `${newWidth}px`;
          rafRef.current = null;
      });
  };

  const handleSidebarMouseUp = (e: MouseEvent) => {
      if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
      }
      
      if (sidebarDragRef.current) {
          // Use latest position for final commit too
          const delta = e.clientX - sidebarDragRef.current.startX;
          const newWidth = Math.max(200, Math.min(600, sidebarDragRef.current.startWidth + delta));
          setSidebarWidth(newWidth);
      }

      if (ghostRef.current) {
          ghostRef.current.style.display = 'none';
      }
      
      sidebarDragRef.current = null;
      document.removeEventListener('mousemove', handleSidebarMouseMove);
      document.removeEventListener('mouseup', handleSidebarMouseUp);
  };

  useEffect(() => {
    if (darkMode) {
        document.body.style.backgroundColor = '#141414';
        document.body.style.color = '#ffffff';
    } else {
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#000000';
    }
  }, [darkMode]);

  return (
    <ConfigProvider
        theme={{
            algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
    >
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
          <Sider 
            theme={darkMode ? "dark" : "light"} 
            width={sidebarWidth} 
            style={{ 
                borderRight: darkMode ? '1px solid #303030' : '1px solid #f0f0f0', 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}
          >
            <div style={{ padding: '10px', borderBottom: darkMode ? '1px solid #303030' : '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontWeight: 'bold', paddingLeft: 8 }}>GoNavi</span>
              <div>
                  <Button type="text" icon={darkMode ? <BulbFilled /> : <BulbOutlined />} onClick={toggleDarkMode} title="切换主题" />
                  <Button type="text" icon={<ConsoleSqlOutlined />} onClick={() => addTab({
                      id: `query-${Date.now()}`,
                      title: '新建查询',
                      type: 'query',
                      connectionId: activeContext?.connectionId || '',
                      dbName: activeContext?.dbName || ''
                  })} title="新建查询" />
                  <Button type="text" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} title="新建连接" />
              </div>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Sidebar onEditConnection={handleEditConnection} />
            </div>

            {/* Sidebar Footer for Log Toggle */}
            <div style={{ padding: '8px', borderTop: darkMode ? '1px solid #303030' : '1px solid #f0f0f0', display: 'flex', justifyContent: 'center' }}>
                 <Button 
                    type={isLogPanelOpen ? "primary" : "text"} 
                    icon={<BugOutlined />} 
                    onClick={() => setIsLogPanelOpen(!isLogPanelOpen)}
                    block
                 >
                    SQL 执行日志
                 </Button>
            </div>
            
            {/* Sidebar Resize Handle */}
            <div 
                onMouseDown={handleSidebarMouseDown}
                style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '5px',
                    cursor: 'col-resize',
                    zIndex: 100,
                    // background: 'transparent' // transparent usually, visible on hover if desired
                }}
                title="拖动调整宽度"
            />
          </Sider>
          <Content style={{ background: darkMode ? '#141414' : '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <TabManager />
            </div>
            {isLogPanelOpen && (
                <LogPanel 
                    height={logPanelHeight} 
                    onClose={() => setIsLogPanelOpen(false)} 
                    onResizeStart={handleLogResizeStart} 
                />
            )}
          </Content>
          <ConnectionModal 
            open={isModalOpen} 
            onClose={handleCloseModal} 
            initialValues={editingConnection}
          />
          
          {/* Ghost Resize Line for Sidebar */}
          <div 
              ref={ghostRef}
              style={{
                  position: 'fixed',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: '4px',
                  background: 'rgba(24, 144, 255, 0.5)',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  display: 'none'
              }}
          />
          
          {/* Ghost Resize Line for Log Panel */}
          <div 
              ref={logGhostRef}
              style={{
                  position: 'fixed',
                  left: sidebarWidth, // Start from sidebar edge
                  right: 0,
                  height: '4px',
                  background: 'rgba(24, 144, 255, 0.5)',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  display: 'none',
                  cursor: 'row-resize'
              }}
          />
        </Layout>
    </ConfigProvider>
  );
}

export default App;