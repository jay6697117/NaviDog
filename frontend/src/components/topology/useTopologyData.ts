import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { DBGetTables, DBGetForeignKeys, DBQuery } from '../../../wailsjs/go/app/App';

export interface TopologyNode {
    id: string; // tableName
    name: string;
    rowCount: number;
    type: 'table';
}

export interface TopologyLink {
    source: string; // tableName
    target: string; // referencedTableName
    label: string;
}

export const useTopologyData = () => {
    const { activeContext, connections } = useStore();
    const [nodes, setNodes] = useState<TopologyNode[]>([]);
    const [links, setLinks] = useState<TopologyLink[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!activeContext) {
            setNodes([]);
            setLinks([]);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const { connectionId, dbName } = activeContext;
            const conn = connections.find(c => c.id === connectionId);

            if (!conn) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Tables
                // Need manual config construction as DBGetTables expects ConnectionConfig
                const config = {
                    ...conn.config,
                    port: Number(conn.config.port),
                    password: conn.config.password || "",
                    database: dbName, // Ensure we connect to the right DB
                    useSSH: conn.config.useSSH || false,
                    ssh: conn.config.ssh || { host: "", port: 22, user: "", password: "", keyPath: "" }
                };

                const tablesRes = await DBGetTables(config as any, dbName);
                if (!tablesRes.success) throw new Error(tablesRes.message);
                const tables: string[] = tablesRes.data || [];

                // 2. Fetch Row Counts (Parallel)
                // We'll use a rough query or just default to 100 if it fails/too slow
                // For MySQL: SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = ?
                const rowCounts: Record<string, number> = {};

                try {
                    // Try getting rough row counts from information_schema (FAST)
                    const countQuery = `SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = '${dbName}'`;
                    const countRes = await DBQuery(config as any, dbName, countQuery);
                    if (countRes.success && Array.isArray(countRes.data)) {
                         countRes.data.forEach((row: any) => {
                             // keys might be slightly different depending on driver return (e.g. UPPER/lower)
                             const name = row['TABLE_NAME'] || row['table_name'];
                             const rows = row['TABLE_ROWS'] || row['table_rows'];
                             if (name) rowCounts[name] = Number(rows) || 0;
                         });
                    }
                } catch (e) {
                    console.warn("Failed to fetch row counts via information_schema", e);
                }

                const newNodes: TopologyNode[] = tables.map(t => ({
                    id: t,
                    name: t,
                    rowCount: rowCounts[t] !== undefined ? rowCounts[t] : 100, // Default fallabck
                    type: 'table'
                }));

                // 3. Fetch Foreign Keys
                // Iterate tables or use information_schema
                const newLinks: TopologyLink[] = [];
                // We can try fetching FKs for all tables or just use information_schema query again for speed
                // Query: SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA = 'db' AND REFERENCED_TABLE_NAME IS NOT NULL

                try {
                    const fkQuery = `
                        SELECT
                            TABLE_NAME,
                            REFERENCED_TABLE_NAME
                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                        WHERE
                            TABLE_SCHEMA = '${dbName}'
                            AND REFERENCED_TABLE_NAME IS NOT NULL
                    `;
                    const fkRes = await DBQuery(config as any, dbName, fkQuery);
                    if (fkRes.success && Array.isArray(fkRes.data)) {
                        fkRes.data.forEach((row: any) => {
                             const src = row['TABLE_NAME'] || row['table_name'];
                             const target = row['REFERENCED_TABLE_NAME'] || row['referenced_table_name'];
                             if (src && target && src !== target) {
                                 // Add link if not existing
                                 if (!newLinks.some(l => l.source === src && l.target === target)) {
                                     newLinks.push({ source: src, target, label: 'fk' });
                                 }
                             }
                        });
                    }
                } catch (e) {
                    console.warn("FK fetch failed", e);
                }

                setNodes(newNodes);
                setLinks(newLinks);

            } catch (err) {
                console.error("Topology fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeContext, connections]);

    return { nodes, links, loading };
};
