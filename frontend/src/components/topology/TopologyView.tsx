import React, { useState, Suspense } from 'react';
import { Button, Tooltip, Spin, Space } from 'antd';
import { ApartmentOutlined, UnorderedListOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { SpaceScene } from './SpaceScene';
import Sidebar from '../Sidebar';
import { SavedConnection } from '../../types';

type ViewMode = 'tree' | 'topology';

interface TopologyViewProps {
  onEditConnection: (conn: SavedConnection) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const TopologyView: React.FC<TopologyViewProps> = ({ onEditConnection, onToggleFullscreen, isFullscreen }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="view-toggle">
        <Space size={4}>
            <Tooltip title="列表视图">
            <Button type={viewMode === 'tree' ? 'primary' : 'text'} icon={<UnorderedListOutlined />} onClick={() => setViewMode('tree')} size="small" />
            </Tooltip>
            <Tooltip title="3D 拓扑视图">
            <Button type={viewMode === 'topology' ? 'primary' : 'text'} icon={<ApartmentOutlined />} onClick={() => setViewMode('topology')} size="small" />
            </Tooltip>
        </Space>
        {onToggleFullscreen && (
            <Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
                <Button
                    type="text"
                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    onClick={onToggleFullscreen}
                    size="small"
                />
            </Tooltip>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {viewMode === 'tree' ? (
          <Sidebar onEditConnection={onEditConnection} />
        ) : (
          <Suspense fallback={<div className="topology-loading"><Spin tip="加载 3D 场景..." /></div>}>
            <SpaceScene />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default TopologyView;
