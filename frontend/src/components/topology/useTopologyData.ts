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
                const config = {
                    ...conn.config,
                    port: Number(conn.config.port),
                    password: conn.config.password || "",
                    database: dbName,
                    useSSH: conn.config.useSSH || false,
                    ssh: conn.config.ssh || { host: "", port: 22, user: "", password: "", keyPath: "" }
                };

                const tablesRes = await DBGetTables(config as any, dbName);
                if (!tablesRes.success) throw new Error(tablesRes.message || "Failed to fetch tables");
                const tables: string[] = tablesRes.data || [];

                const rowCounts: Record<string, number> = {};
                const newLinks: TopologyLink[] = [];

                if (conn.config.type === 'mysql') {
                    // --- MySQL Optimization (Batch) ---
                    try {
                        const countQuery = `SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = '${dbName}'`;
                        const countRes = await DBQuery(config as any, dbName, countQuery);
                        if (countRes.success && Array.isArray(countRes.data)) {
                             countRes.data.forEach((row: any) => {
                                 const name = row['TABLE_NAME'] || row['table_name'];
                                 const rows = row['TABLE_ROWS'] || row['table_rows'];
                                 if (name) rowCounts[name] = Number(rows) || 0;
                             });
                        }

                        const fkQuery = `
                            SELECT TABLE_NAME, REFERENCED_TABLE_NAME
                            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                            WHERE TABLE_SCHEMA = '${dbName}' AND REFERENCED_TABLE_NAME IS NOT NULL
                        `;
                        const fkRes = await DBQuery(config as any, dbName, fkQuery);
                        if (fkRes.success && Array.isArray(fkRes.data)) {
                            fkRes.data.forEach((row: any) => {
                                 const src = row['TABLE_NAME'] || row['table_name'];
                                 const target = row['REFERENCED_TABLE_NAME'] || row['referenced_table_name'];
                                 if (src && target && src !== target) {
                                     if (!newLinks.some(l => l.source === src && l.target === target)) {
                                         newLinks.push({ source: src, target, label: 'fk' });
                                     }
                                 }
                            });
                        }
                    } catch (e) {
                        console.warn("MySQL optimized fetch failed, falling back", e);
                    }
                } else {
                    // --- Generic / SQLite Fallback (Iterative) ---
                    // 2. Fetch Row Counts
                    // We'll limit concurrency to avoid overwhelming the DB
                    const fetchCount = async (table: string) => {
                        try {
                            // Simple count per table
                            const res = await DBQuery(config as any, dbName, `SELECT count(*) as c FROM "${table}"`);
                            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                                const count = Number(Object.values(res.data[0])[0]); // Get first value
                                rowCounts[table] = isNaN(count) ? 0 : count;
                            }
                        } catch (e) { /* ignore */ }
                    };

                    // Run quickly for up to 20 tables slightly parallel, then others sequential?
                    // For now, let's just do sequential for safety on SQLite
                    for (const table of tables) {
                         await fetchCount(table);
                    }

                    // 3. Fetch FKs
                    for (const table of tables) {
                        try {
                            const res = await DBGetForeignKeys(config as any, dbName, table);
                            if (res.success && Array.isArray(res.data)) {
                                res.data.forEach((fk: any) => {
                                    // fk structure: { constraintName, columnName, refTableName, refColumnName }
                                    if (fk.refTableName && fk.refTableName !== table) {
                                        if (!newLinks.some(l => l.source === table && l.target === fk.refTableName)) {
                                            newLinks.push({ source: table, target: fk.refTableName, label: 'fk' });
                                        }
                                    }
                                });
                            }
                        } catch (e) { /* ignore */ }
                    }
                }

                const newNodes: TopologyNode[] = tables.map(t => ({
                    id: t,
                    name: t,
                    rowCount: rowCounts[t] !== undefined ? rowCounts[t] : 100,
                    type: 'table'
                }));

                setNodes(newNodes);
                setLinks(newLinks);

            } catch (err) {
                console.error("Topology fetch failed", err);
                // Fallback to empty so it doesn't break
                setNodes([]);
                setLinks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeContext, connections]);

    return { nodes, links, loading };
};
