import React, { useMemo } from 'react';
import { Tabs, Button } from 'antd';
import { useStore } from '../store';
import DataViewer from './DataViewer';
import QueryEditor from './QueryEditor';
import TableDesigner from './TableDesigner';

const TabManager: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useStore();

  const onChange = (newActiveKey: string) => {
    setActiveTab(newActiveKey);
  };

  const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      closeTab(targetKey as string);
    }
  };

  const items = useMemo(() => tabs.map(tab => {
    let content;
    if (tab.type === 'query') {
      content = <QueryEditor tab={tab} />;
    } else if (tab.type === 'table') {
      content = <DataViewer tab={tab} />;
    } else if (tab.type === 'design') {
      content = <TableDesigner tab={tab} />;
    }
    
    return {
      label: tab.title,
      key: tab.id,
      children: content,
    };
  }), [tabs]);

  return (
    <>
        <style>{`
            .ant-tabs-content { height: 100%; }
            .ant-tabs-tabpane { height: 100%; }
        `}</style>
        <Tabs
            type="editable-card"
            onChange={onChange}
            activeKey={activeTabId || undefined}
            onEdit={onEdit}
            items={items}
            style={{ height: '100%' }}
            hideAdd
        />
    </>
  );
};

export default TabManager;
