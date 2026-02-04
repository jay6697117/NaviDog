import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { DatabaseOutlined, TableOutlined, KeyOutlined, LinkOutlined } from '@ant-design/icons';

interface TableNodeProps {
  data: {
    label: string;
    rowCount?: number;
    dbName?: string;
    isKey?: boolean;
    onNodeClick?: (label: string) => void;
  };
}

export const TableNode = memo(({ data }: TableNodeProps) => {
  return (
    <div
      onClick={() => data.onNodeClick && data.onNodeClick(data.label)}
      style={{
        padding: '10px 15px',
        borderRadius: '8px',
        background: '#1f1f1f',
        border: '1px solid #434343',
        color: '#fff',
        minWidth: '180px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      className="nodrag table-node-wrapper"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #303030',
        paddingBottom: '8px',
        marginBottom: '8px',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        <TableOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {data.label}
        </span>
      </div>

      <div style={{ fontSize: '12px', color: '#8c8c8c', display: 'flex', justifyContent: 'space-between' }}>
        <span>Rows:</span>
        <span style={{ color: '#d9d9d9' }}>{data.rowCount?.toLocaleString() || 0}</span>
      </div>

      {/* Handles for connections */}
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
});
