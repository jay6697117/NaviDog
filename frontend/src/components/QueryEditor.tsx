import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Button, message, Modal, Input, Form, Dropdown, MenuProps, Tooltip, Select, Tabs } from 'antd';
import { PlayCircleOutlined, SaveOutlined, FormatPainterOutlined, SettingOutlined, CloseOutlined } from '@ant-design/icons';
import { format } from 'sql-formatter';
import { TabData, ColumnDefinition } from '../types';
import { useStore } from '../store';
import { DBQuery, DBGetTables, DBGetAllColumns, DBGetDatabases, DBGetColumns } from '../../wailsjs/go/app/App';
import DataGrid, { GONAVI_ROW_KEY } from './DataGrid';

const QueryEditor: React.FC<{ tab: TabData }> = ({ tab }) => {
  const [query, setQuery] = useState(tab.query || 'SELECT * FROM ');
  
  type ResultSet = {
      key: string;
      sql: string;
      rows: any[];
      columns: string[];
      tableName?: string;
      pkColumns: string[];
      readOnly: boolean;
  };

  // Result Sets
  const [resultSets, setResultSets] = useState<ResultSet[]>([]);
  const [activeResultKey, setActiveResultKey] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveForm] = Form.useForm();
  
  // Database Selection
  const [currentConnectionId, setCurrentConnectionId] = useState<string>(tab.connectionId);
  const [currentDb, setCurrentDb] = useState<string>(tab.dbName || '');
  const [dbList, setDbList] = useState<string[]>([]);

  // Resizing state
  const [editorHeight, setEditorHeight] = useState(300);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const dragRef = useRef<{ startY: number, startHeight: number } | null>(null);
  const tablesRef = useRef<string[]>([]); // Store tables for autocomplete
  const allColumnsRef = useRef<{tableName: string, name: string, type: string}[]>([]); // Store all columns

  const { connections, addSqlLog } = useStore();
  const saveQuery = useStore(state => state.saveQuery);
  const darkMode = useStore(state => state.darkMode);
  const sqlFormatOptions = useStore(state => state.sqlFormatOptions);
  const setSqlFormatOptions = useStore(state => state.setSqlFormatOptions);

  // If opening a saved query, load its SQL
  useEffect(() => {
      if (tab.query) setQuery(tab.query);
  }, [tab.query]);

  // Fetch Database List
  useEffect(() => {
      const fetchDbs = async () => {
          const conn = connections.find(c => c.id === currentConnectionId);
          if (!conn) return;
          
          const config = { 
            ...conn.config, 
            port: Number(conn.config.port),
            password: conn.config.password || "",
            database: conn.config.database || "",
            useSSH: conn.config.useSSH || false,
            ssh: conn.config.ssh || { host: "", port: 22, user: "", password: "", keyPath: "" }
          };

          const res = await DBGetDatabases(config as any);
          if (res.success && Array.isArray(res.data)) {
              const dbs = res.data.map((row: any) => row.Database || row.database);
              setDbList(dbs);
              if (!currentDb) {
                  if (conn.config.database) setCurrentDb(conn.config.database);
                  else if (dbs.length > 0 && dbs[0] !== 'information_schema') setCurrentDb(dbs[0]);
              }
          } else {
              setDbList([]);
          }
      };
      fetchDbs();
  }, [currentConnectionId, connections, currentDb]);

  // Fetch Metadata for Autocomplete
  useEffect(() => {
      const fetchMetadata = async () => {
          const conn = connections.find(c => c.id === currentConnectionId);
          if (!conn || !currentDb) return;

          const config = { 
            ...conn.config, 
            port: Number(conn.config.port),
            password: conn.config.password || "",
            database: conn.config.database || "",
            useSSH: conn.config.useSSH || false,
            ssh: conn.config.ssh || { host: "", port: 22, user: "", password: "", keyPath: "" }
          };

          const resTables = await DBGetTables(config as any, currentDb);
          if (resTables.success && Array.isArray(resTables.data)) {
              const tableNames = resTables.data.map((row: any) => Object.values(row)[0] as string);
              tablesRef.current = tableNames;
          } else {
              tablesRef.current = [];
          }

          if (config.type === 'mysql' || !config.type) {
              const resCols = await DBGetAllColumns(config as any, currentDb);
              if (resCols.success && Array.isArray(resCols.data)) {
                  allColumnsRef.current = resCols.data;
              } else {
                  allColumnsRef.current = [];
              }
          }
      };
      fetchMetadata();
  }, [currentConnectionId, currentDb, connections]);

  // Handle Resizing
  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startY: e.clientY, startHeight: editorHeight };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = e.clientY - dragRef.current.startY;
      const newHeight = Math.max(100, Math.min(window.innerHeight - 200, dragRef.current.startHeight + delta));
      setEditorHeight(newHeight);
  };

  const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
  };

  // Setup Autocomplete and Editor
  const handleEditorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      monaco.languages.registerCompletionItemProvider('sql', {
          provideCompletionItems: (model: any, position: any) => {
              const word = model.getWordUntilPosition(position);
              const range = {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: word.startColumn,
                  endColumn: word.endColumn,
              };

              const tableRegex = /(?:FROM|JOIN|UPDATE|INTO)\s+[`"]?(\w+)[`"]?/gi;
              const foundTables = new Set<string>();
              let match;
              const fullText = model.getValue(); 
              while ((match = tableRegex.exec(fullText)) !== null) {
                  foundTables.add(match[1]);
              }

              const relevantColumns = allColumnsRef.current
                  .filter(c => foundTables.has(c.tableName))
                  .map(c => ({
                      label: c.name,
                      kind: monaco.languages.CompletionItemKind.Field,
                      insertText: c.name,
                      detail: `${c.type} (${c.tableName})`,
                      range,
                      sortText: '0' + c.name
                  }));

              const suggestions = [
                  ...['SELECT', 'FROM', 'WHERE', 'LIMIT', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP BY', 'ORDER BY', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'VALUES', 'SET', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'Add', 'MODIFY', 'CHANGE', 'COLUMN', 'KEY', 'PRIMARY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'AUTO_INCREMENT', 'COMMENT', 'SHOW', 'DESCRIBE', 'EXPLAIN'].map(k => ({
                      label: k,
                      kind: monaco.languages.CompletionItemKind.Keyword,
                      insertText: k,
                      range
                  })),
                  ...tablesRef.current.map(t => ({
                      label: t,
                      kind: monaco.languages.CompletionItemKind.Class,
                      insertText: t,
                      detail: 'Table',
                      range
                  })),
                  ...relevantColumns
              ];
              return { suggestions };
          }
      });
  };

  const handleFormat = () => {
      try {
          const formatted = format(query, { language: 'mysql', keywordCase: sqlFormatOptions.keywordCase });
          setQuery(formatted);
      } catch (e) {
          message.error("格式化失败: SQL 语法可能有误");
      }
  };

  const formatSettingsMenu: MenuProps['items'] = [
      { 
          key: 'upper', 
          label: '关键字大写', 
          icon: sqlFormatOptions.keywordCase === 'upper' ? '✓' : undefined,
          onClick: () => setSqlFormatOptions({ keywordCase: 'upper' }) 
      },
      { 
          key: 'lower', 
          label: '关键字小写', 
          icon: sqlFormatOptions.keywordCase === 'lower' ? '✓' : undefined,
          onClick: () => setSqlFormatOptions({ keywordCase: 'lower' }) 
      },
  ];

  const splitSQLStatements = (sql: string): string[] => {
    const text = (sql || '').replace(/\r\n/g, '\n');
    const statements: string[] = [];

    let cur = '';
    let inSingle = false;
    let inDouble = false;
    let inBacktick = false;
    let escaped = false;
    let inLineComment = false;
    let inBlockComment = false;
    let dollarTag: string | null = null; // postgres/kingbase: $$...$$ or $tag$...$tag$

    const push = () => {
        const s = cur.trim();
        if (s) statements.push(s);
        cur = '';
    };

    const isWS = (ch: string) => ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = i + 1 < text.length ? text[i + 1] : '';
        const prev = i > 0 ? text[i - 1] : '';
        const next2 = i + 2 < text.length ? text[i + 2] : '';

        if (!inSingle && !inDouble && !inBacktick) {
            if (inLineComment) {
                cur += ch;
                if (ch === '\n') inLineComment = false;
                continue;
            }

            if (inBlockComment) {
                cur += ch;
                if (ch === '*' && next === '/') {
                    cur += next;
                    i++;
                    inBlockComment = false;
                }
                continue;
            }

            // Start comments
            if (ch === '/' && next === '*') {
                cur += ch + next;
                i++;
                inBlockComment = true;
                continue;
            }
            if (ch === '#') {
                cur += ch;
                inLineComment = true;
                continue;
            }
            if (ch === '-' && next === '-' && (i === 0 || isWS(prev)) && (next2 === '' || isWS(next2))) {
                cur += ch + next;
                i++;
                inLineComment = true;
                continue;
            }

            // Dollar-quoted strings (PG/Kingbase)
            if (dollarTag) {
                if (text.startsWith(dollarTag, i)) {
                    cur += dollarTag;
                    i += dollarTag.length - 1;
                    dollarTag = null;
                } else {
                    cur += ch;
                }
                continue;
            }
            if (ch === '$') {
                const m = text.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
                if (m && m[0]) {
                    dollarTag = m[0];
                    cur += dollarTag;
                    i += dollarTag.length - 1;
                    continue;
                }
            }
        }

        if (escaped) {
            cur += ch;
            escaped = false;
            continue;
        }

        if ((inSingle || inDouble) && ch === '\\') {
            cur += ch;
            escaped = true;
            continue;
        }

        if (!inDouble && !inBacktick && ch === '\'') {
            inSingle = !inSingle;
            cur += ch;
            continue;
        }
        if (!inSingle && !inBacktick && ch === '"') {
            inDouble = !inDouble;
            cur += ch;
            continue;
        }
        if (!inSingle && !inDouble && ch === '`') {
            inBacktick = !inBacktick;
            cur += ch;
            continue;
        }

        if (!inSingle && !inDouble && !inBacktick && !dollarTag && (ch === ';' || ch === '；')) {
            push();
            continue;
        }

        cur += ch;
    }

    push();
    return statements;
  };

  const getSelectedSQL = (): string => {
      const editor = editorRef.current;
      if (!editor) return '';
      const model = editor.getModel?.();
      const selection = editor.getSelection?.();
      if (!model || !selection) return '';

      const selected = model.getValueInRange?.(selection) || '';
      if (typeof selected !== 'string') return '';
      if (!selected.trim()) return '';
      return selected;
  };

  const handleRun = async () => {
    if (!query.trim()) return;
    if (!currentDb) {
        message.error("请先选择数据库");
        return;
    }
    setLoading(true);
    const runStartTime = Date.now();
    const conn = connections.find(c => c.id === currentConnectionId);
    if (!conn) {
        message.error("Connection not found");
        setLoading(false);
        return;
    }

    const config = { 
        ...conn.config, 
        port: Number(conn.config.port),
        password: conn.config.password || "",
        database: conn.config.database || "",
        useSSH: conn.config.useSSH || false,
        ssh: conn.config.ssh || { host: "", port: 22, user: "", password: "", keyPath: "" }
    };

    try {
        const rawSQL = getSelectedSQL() || query;
        const statements = splitSQLStatements(rawSQL);
        if (statements.length === 0) {
            message.info('没有可执行的 SQL。');
            setResultSets([]);
            setActiveResultKey('');
            return;
        }

        const nextResultSets: ResultSet[] = [];

        for (let idx = 0; idx < statements.length; idx++) {
            const sql = statements[idx];
            const startTime = Date.now();
            const res = await DBQuery(config as any, currentDb, sql);
            const duration = Date.now() - startTime;

            addSqlLog({
                id: `log-${Date.now()}-query-${idx + 1}`,
                timestamp: Date.now(),
                sql,
                status: res.success ? 'success' : 'error',
                duration,
                message: res.success ? '' : res.message,
                affectedRows: (res.success && !Array.isArray(res.data)) ? (res.data as any).affectedRows : (Array.isArray(res.data) ? res.data.length : undefined),
                dbName: currentDb
            });

            if (!res.success) {
                const prefix = statements.length > 1 ? `第 ${idx + 1} 条语句执行失败：` : '';
                message.error(prefix + res.message);
                setResultSets([]);
                setActiveResultKey('');
                return;
            }

            if (Array.isArray(res.data)) {
                const rows = (res.data as any[]) || [];
                const cols = (res.fields && res.fields.length > 0)
                    ? (res.fields as string[])
                    : (rows.length > 0 ? Object.keys(rows[0]) : []);

                rows.forEach((row: any, i: number) => {
                    if (row && typeof row === 'object') row[GONAVI_ROW_KEY] = i;
                });

                let simpleTableName: string | undefined = undefined;
                let primaryKeys: string[] = [];
                const tableMatch = sql.match(/^\s*SELECT\s+\*\s+FROM\s+[`"]?(\w+)[`"]?\s*(?:WHERE.*)?(?:ORDER BY.*)?(?:LIMIT.*)?$/i);
                if (tableMatch) {
                    simpleTableName = tableMatch[1];
                    const resCols = await DBGetColumns(config as any, currentDb, simpleTableName);
                    if (resCols.success) {
                        primaryKeys = (resCols.data as ColumnDefinition[]).filter(c => c.key === 'PRI').map(c => c.name);
                    }
                }

                nextResultSets.push({
                    key: `result-${idx + 1}`,
                    sql,
                    rows,
                    columns: cols,
                    tableName: simpleTableName,
                    pkColumns: primaryKeys,
                    readOnly: !simpleTableName
                });
            } else {
                const affected = Number((res.data as any)?.affectedRows);
                if (Number.isFinite(affected)) {
                    const row = { affectedRows: affected };
                    (row as any)[GONAVI_ROW_KEY] = 0;
                    nextResultSets.push({
                        key: `result-${idx + 1}`,
                        sql,
                        rows: [row],
                        columns: ['affectedRows'],
                        pkColumns: [],
                        readOnly: true
                    });
                }
            }
        }

        setResultSets(nextResultSets);
        setActiveResultKey(nextResultSets[0]?.key || '');

        if (statements.length > 1) {
            message.success(`已执行 ${statements.length} 条语句，生成 ${nextResultSets.length} 个结果集。`);
        } else if (nextResultSets.length === 0) {
            message.success('执行成功。');
        }
    } catch (e: any) {
        message.error("Error executing query: " + e.message);
        addSqlLog({
            id: `log-${Date.now()}-error`,
            timestamp: Date.now(),
            sql: getSelectedSQL() || query,
            status: 'error',
            duration: Date.now() - runStartTime,
            message: e.message,
            dbName: currentDb
        });
        setResultSets([]);
        setActiveResultKey('');
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
      try {
          const values = await saveForm.validateFields();
          saveQuery({
              id: tab.id.startsWith('saved-') ? tab.id : `saved-${Date.now()}`,
              name: values.name,
              sql: query,
              connectionId: currentConnectionId,
              dbName: currentDb || tab.dbName || '',
              createdAt: Date.now()
          });
          message.success('查询已保存！');
          setIsSaveModalOpen(false);
      } catch (e) {
      }
  };

  const handleCloseResult = (key: string) => {
      setResultSets(prev => {
          const idx = prev.findIndex(r => r.key === key);
          if (idx < 0) return prev;
          const next = prev.filter(r => r.key !== key);

          setActiveResultKey(prevActive => {
              if (prevActive && prevActive !== key) return prevActive;
              const nextKey = next[idx]?.key || next[idx - 1]?.key || next[0]?.key || '';
              return nextKey;
          });

          return next;
      });
  };

  return (
    <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <style>{`
        .query-result-tabs {
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .query-result-tabs .ant-tabs-nav {
          flex: 0 0 auto;
        }
        .query-result-tabs .ant-tabs-content-holder {
          flex: 1 1 auto;
          overflow: hidden;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .query-result-tabs .ant-tabs-content {
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .query-result-tabs .ant-tabs-tabpane {
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .query-result-tabs .ant-tabs-tabpane > div {
          flex: 1 1 auto;
          min-height: 0;
        }
        .query-result-tabs .ant-tabs-tabpane-hidden {
          display: none !important;
        }
        .query-result-tabs .ant-tabs-ink-bar {
          transition: none !important;
        }
      `}</style>
      <div style={{ padding: '8px', borderBottom: '1px solid #eee', display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
        <Select 
            style={{ width: 150 }} 
            placeholder="选择连接"
            value={currentConnectionId}
            onChange={(val) => {
                setCurrentConnectionId(val);
                setCurrentDb('');
            }}
            options={connections.map(c => ({ label: c.name, value: c.id }))}
            showSearch
        />
        <Select 
            style={{ width: 200 }} 
            placeholder="选择数据库"
            value={currentDb}
            onChange={setCurrentDb}
            options={dbList.map(db => ({ label: db, value: db }))}
            showSearch
        />
        <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleRun} loading={loading}>
          运行
        </Button>
        <Button icon={<SaveOutlined />} onClick={() => {
            saveForm.setFieldsValue({ name: tab.title.replace('Query (', '').replace(')', '') });
            setIsSaveModalOpen(true);
        }}>
          保存
        </Button>
        
        <Button.Group>
            <Tooltip title="美化 SQL">
                <Button icon={<FormatPainterOutlined />} onClick={handleFormat}>美化</Button>
            </Tooltip>
            <Dropdown menu={{ items: formatSettingsMenu }} placement="bottomRight">
                <Button icon={<SettingOutlined />} />
            </Dropdown>
        </Button.Group>
      </div>
      
      <div style={{ height: editorHeight, minHeight: '100px', borderBottom: '1px solid #eee' }}>
        <Editor 
          height="100%" 
          defaultLanguage="sql" 
          theme={darkMode ? "vs-dark" : "light"}
          value={query} 
          onChange={(val) => setQuery(val || '')}
          onMount={handleEditorDidMount}
          options={{ 
            minimap: { enabled: false }, 
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontSize: 14
          }}
        />
      </div>

      <div 
        onMouseDown={handleMouseDown}
        style={{ 
            height: '5px', 
            cursor: 'row-resize', 
            background: darkMode ? '#333' : '#f0f0f0',
            flexShrink: 0,
            zIndex: 10 
        }} 
        title="拖动调整高度"
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
        {resultSets.length > 0 ? (
          <Tabs
              className="query-result-tabs"
              activeKey={activeResultKey || resultSets[0]?.key}
              onChange={setActiveResultKey}
              animated={false}
              style={{ flex: 1, minHeight: 0 }}
              items={resultSets.map((rs, idx) => ({
                  key: rs.key,
                  label: (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Tooltip title={rs.sql}>
                              <span>{`结果 ${idx + 1}${Array.isArray(rs.rows) ? ` (${rs.rows.length})` : ''}`}</span>
                          </Tooltip>
                          <Tooltip title="关闭结果">
                              <span
                                  onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCloseResult(rs.key);
                                  }}
                                  style={{ display: 'inline-flex', alignItems: 'center', color: '#999', cursor: 'pointer' }}
                              >
                                  <CloseOutlined style={{ fontSize: 12 }} />
                              </span>
                          </Tooltip>
                      </div>
                  ),
                  children: (
                      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                          <DataGrid
                              data={rs.rows}
                              columnNames={rs.columns}
                              loading={loading}
                              tableName={rs.tableName}
                              dbName={currentDb}
                              connectionId={currentConnectionId}
                              pkColumns={rs.pkColumns}
                              onReload={handleRun}
                              readOnly={rs.readOnly}
                          />
                      </div>
                  )
              }))}
          />
        ) : (
          <div style={{ flex: 1, minHeight: 0 }} />
        )}
      </div>

      <Modal 
        title="保存查询" 
        open={isSaveModalOpen} 
        onOk={handleSave} 
        onCancel={() => setIsSaveModalOpen(false)}
        okText="确认"
        cancelText="取消"
      >
          <Form form={saveForm} layout="vertical">
              <Form.Item name="name" label="查询名称" rules={[{ required: true, message: '请输入查询名称' }]}>
                  <Input placeholder="例如：查询所有用户" />
              </Form.Item>
          </Form>
      </Modal>
    </div>
  );
};

export default QueryEditor;
