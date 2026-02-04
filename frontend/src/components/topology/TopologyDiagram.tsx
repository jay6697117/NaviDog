import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TableNode } from './TableNode2D';
import { useTopologyData } from './useTopologyData';
import { getLayoutedElements } from './layout';
import { useStore } from '../../store';
import { Spin, Empty } from 'antd';

const nodeTypes = {
  table: TableNode,
};

export const TopologyDiagram: React.FC = () => {
    const { nodes: dataNodes, links: dataLinks, loading, error } = useTopologyData();
    const { activeContext, addTab } = useStore();

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // Handle Node Click
    const onNodeClick = useCallback((label: string) => {
         if (!activeContext) return;
         const { connectionId, dbName } = activeContext;

         addTab({
            id: `${connectionId}-${dbName}-${label}`,
            title: label,
            type: 'table',
            connectionId: connectionId,
            dbName: dbName,
            tableName: label,
         });
    }, [activeContext, addTab]);

    // Transform Data to Flow Elements when data loads
    useEffect(() => {
        if (loading || !activeContext) return;

        if (dataNodes.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }

        const initialNodes = dataNodes.map((node) => ({
            id: node.id,
            type: 'table',
            data: {
                label: node.name,
                rowCount: node.rowCount,
                onNodeClick
            },
            position: { x: 0, y: 0 }, // Initial position, will be laid out
        }));

        const initialEdges = dataLinks.map((link, i) => ({
            id: `e-${link.source}-${link.target}-${i}`,
            source: link.source,
            target: link.target,
            animated: true,
            style: { stroke: '#5b8c00' },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#5b8c00',
            },
        }));

        // Apply Layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

    }, [dataNodes, dataLinks, loading, activeContext, onNodeClick]);


    if (loading) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin tip="Loading Topology..." size="large" />
            </div>
        );
    }

    if (!activeContext) {
        return (
             <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#666' }}>
                <Empty description="No Database Selected" />
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', background: '#141414' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeDoubleClick={(event, node) => onNodeClick(node.data.label as string)}
                fitView
                colorMode="dark"
            >
                <Background color="#333" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};
