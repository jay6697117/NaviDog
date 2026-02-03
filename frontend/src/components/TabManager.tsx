import React, { useMemo } from 'react';
import { Tabs, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useStore } from '../store';
import DataViewer from './DataViewer';
import QueryEditor from './QueryEditor';
import TableDesigner from './TableDesigner';

const TabManager: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, closeOtherTabs, closeTabsToLeft, closeTabsToRight, closeAllTabs } = useStore();

  const onChange = (newActiveKey: string) => {
    setActiveTab(newActiveKey);
  };

  const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      closeTab(targetKey as string);
    }
  };

  const items = useMemo(() => tabs.map((tab, index) => {
    let content;
    if (tab.type === 'query') {
      content = <QueryEditor tab={tab} />;
    } else if (tab.type === 'table') {
      content = <DataViewer tab={tab} />;
    } else if (tab.type === 'design') {
      content = <TableDesigner tab={tab} />;
    }

    const menuItems: MenuProps['items'] = [
      {
        key: 'close-other',
        label: '关闭其他页',
        disabled: tabs.length <= 1,
        onClick: () => closeOtherTabs(tab.id),
      },
      {
        key: 'close-left',
        label: '关闭左侧',
        disabled: index === 0,
        onClick: () => closeTabsToLeft(tab.id),
      },
      {
        key: 'close-right',
        label: '关闭右侧',
        disabled: index === tabs.length - 1,
        onClick: () => closeTabsToRight(tab.id),
      },
      { type: 'divider' },
      {
        key: 'close-all',
        label: '关闭所有',
        disabled: tabs.length === 0,
        onClick: () => closeAllTabs(),
      },
    ];
    
    return {
      label: (
        <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
          <span onContextMenu={(e) => e.preventDefault()}>{tab.title}</span>
        </Dropdown>
      ),
      key: tab.id,
      children: content,
    };
  }), [tabs, closeOtherTabs, closeTabsToLeft, closeTabsToRight, closeAllTabs]);

  return (
    <>
        <style>{`
            .main-tabs {
              height: 100%;
              flex: 1 1 auto;
              min-height: 0;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            .main-tabs .ant-tabs-nav {
              flex: 0 0 auto;
            }
            .main-tabs .ant-tabs-content-holder {
              flex: 1 1 auto;
              min-height: 0;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .main-tabs .ant-tabs-content {
              flex: 1 1 auto;
              min-height: 0;
              display: flex;
              flex-direction: column;
            }
            .main-tabs .ant-tabs-tabpane {
              flex: 1 1 auto;
              min-height: 0;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            .main-tabs .ant-tabs-tabpane > div {
              flex: 1 1 auto;
              min-height: 0;
            }
            .main-tabs .ant-tabs-tabpane-hidden {
              display: none !important;
            }
        `}</style>
        <Tabs
            className="main-tabs"
            type="editable-card"
            onChange={onChange}
            activeKey={activeTabId || undefined}
            onEdit={onEdit}
            items={items}
            hideAdd
        />
    </>
  );
};

export default TabManager;
