import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, message, Checkbox, Divider, Collapse, Select, Alert } from 'antd';
import { useStore } from '../store';
import { MySQLConnect, MySQLGetDatabases } from '../../wailsjs/go/app/App';
import { SavedConnection } from '../types';

const ConnectionModal: React.FC<{ open: boolean; onClose: () => void; initialValues?: SavedConnection | null }> = ({ open, onClose, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [useSSH, setUseSSH] = useState(false);
  const [dbType, setDbType] = useState('mysql');
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [dbList, setDbList] = useState<string[]>([]);
  const addConnection = useStore((state) => state.addConnection);
  const updateConnection = useStore((state) => state.updateConnection);

  useEffect(() => {
      if (open) {
          setTestResult(null); // Reset test result
          setDbList([]);
          if (initialValues) {
              form.setFieldsValue({
                  type: initialValues.config.type,
                  name: initialValues.name,
                  host: initialValues.config.host,
                  port: initialValues.config.port,
                  user: initialValues.config.user,
                  password: initialValues.config.password,
                  database: initialValues.config.database,
                  includeDatabases: initialValues.includeDatabases,
                  useSSH: initialValues.config.useSSH,
                  sshHost: initialValues.config.ssh?.host,
                  sshPort: initialValues.config.ssh?.port,
                  sshUser: initialValues.config.ssh?.user,
                  sshPassword: initialValues.config.ssh?.password,
                  sshKeyPath: initialValues.config.ssh?.keyPath,
              });
              setUseSSH(initialValues.config.useSSH || false);
              setDbType(initialValues.config.type);
          } else {
              form.resetFields();
              setUseSSH(false);
              setDbType('mysql');
          }
      }
  }, [open, initialValues]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const config = await buildConfig(values);
      
      // Use Connect to verify before saving
      const res = await MySQLConnect(config as any);
      setLoading(false);
      
      if (res.success) {
        const newConn = {
          id: initialValues ? initialValues.id : Date.now().toString(),
          name: values.name || (values.type === 'sqlite' ? 'SQLite DB' : values.host),
          config: config,
          includeDatabases: values.includeDatabases
        };

        if (initialValues) {
            updateConnection(newConn);
            message.success('连接已更新！');
        } else {
            addConnection(newConn);
            message.success('连接已保存！');
        }
        
        form.resetFields();
        setUseSSH(false);
        setDbType('mysql');
        onClose();
      } else {
        message.error('连接失败: ' + res.message);
      }
    } catch (e) {
      setLoading(false);
    }
  };

  const handleTest = async () => {
      try {
          const values = await form.validateFields();
          setLoading(true);
          setTestResult(null); // Clear previous result
          const config = await buildConfig(values);
          const res = await (window as any).go.app.App.TestConnection(config);
          setLoading(false);
          if (res.success) {
              setTestResult({ type: 'success', message: res.message });
              // Fetch DB List on success
              const dbRes = await MySQLGetDatabases(config as any);
              if (dbRes.success) {
                  const dbs = (dbRes.data as any[]).map((row: any) => row.Database || row.database);
                  setDbList(dbs);
              }
          } else {
              setTestResult({ type: 'error', message: "测试失败: " + res.message });
          }
      } catch (e) {
          setLoading(false);
      }
  };

  const buildConfig = async (values: any) => {
      const sshConfig = values.useSSH ? {
          host: values.sshHost,
          port: Number(values.sshPort),
          user: values.sshUser,
          password: values.sshPassword || "",
          keyPath: values.sshKeyPath || ""
      } : { host: "", port: 22, user: "", password: "", keyPath: "" };

      return { 
          type: values.type,
          host: values.host,
          port: Number(values.port || 0),
          user: values.user || "",
          password: values.password || "",
          database: values.database || "",
          useSSH: !!values.useSSH,
          ssh: sshConfig
      };
  };

  const isSqlite = dbType === 'sqlite';

  return (
    <Modal 
        title={initialValues ? "编辑连接" : "新建连接"}
        open={open} 
        onCancel={onClose} 
        onOk={handleOk} 
        confirmLoading={loading} 
        footer={[
            <Button key="test" loading={loading} onClick={handleTest}>测试连接</Button>,
            <Button key="cancel" onClick={onClose}>取消</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={handleOk}>保存</Button>
        ]}
        width={600}
        zIndex={10001} // Increase z-index
        destroyOnHidden // Reset on close
        maskClosable={false} // Prevent accidental close by clicking mask, user must click X or Cancel
    >
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ type: 'mysql', host: 'localhost', port: 3306, user: 'root', useSSH: false, sshPort: 22 }}
        onValuesChange={(changed) => {
            if (testResult) setTestResult(null); // Clear result on change
            if (changed.useSSH !== undefined) setUseSSH(changed.useSSH);
            if (changed.type !== undefined) setDbType(changed.type);
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="type" label="数据库类型" style={{ width: 120 }}>
                <Select>
                    <Select.Option value="mysql">MySQL</Select.Option>
                    <Select.Option value="postgres">PostgreSQL</Select.Option>
                    <Select.Option value="sqlite">SQLite</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item name="name" label="连接名称" style={{ flex: 1 }}>
              <Input placeholder="例如：本地测试库" />
            </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="host" label={isSqlite ? "文件路径 (绝对路径)" : "主机地址 (Host)"} rules={[{ required: true, message: '请输入地址/路径' }]} style={{ flex: 1 }}>
              <Input placeholder={isSqlite ? "/path/to/db.sqlite" : "localhost"} />
            </Form.Item>
            {!isSqlite && (
            <Form.Item name="port" label="端口 (Port)" rules={[{ required: true, message: '请输入端口号' }]} style={{ width: 100 }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            )}
        </div>

        {!isSqlite && (
        <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="user" label="用户名" rules={[{ required: true, message: '请输入用户名' }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label="密码" style={{ flex: 1 }}>
              <Input.Password />
            </Form.Item>
        </div>
        )}
        
        {!isSqlite && (
        <Form.Item name="includeDatabases" label="显示数据库 (留空显示全部)" help="连接测试成功后可选择">
            <Select mode="multiple" placeholder="选择显示的数据库" allowClear>
                {dbList.map(db => <Select.Option key={db} value={db}>{db}</Select.Option>)}
            </Select>
        </Form.Item>
        )}

        {!isSqlite && (
        <>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item name="useSSH" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox>使用 SSH 隧道 (SSH Tunnel)</Checkbox>
            </Form.Item>

            {useSSH && (
                <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: 6, marginTop: 12 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="sshHost" label="SSH 主机" rules={[{ required: useSSH, message: '请输入SSH主机' }]} style={{ flex: 1 }}>
                            <Input placeholder="ssh.example.com" />
                        </Form.Item>
                        <Form.Item name="sshPort" label="端口" rules={[{ required: useSSH, message: '请输入SSH端口' }]} style={{ width: 100 }}>
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="sshUser" label="SSH 用户" rules={[{ required: useSSH, message: '请输入SSH用户' }]} style={{ flex: 1 }}>
                            <Input placeholder="root" />
                        </Form.Item>
                        <Form.Item name="sshPassword" label="SSH 密码" style={{ flex: 1 }}>
                            <Input.Password placeholder="密码" />
                        </Form.Item>
                    </div>
                     <Form.Item name="sshKeyPath" label="私钥路径 (可选)" help="例如: /Users/name/.ssh/id_rsa">
                        <Input placeholder="绝对路径" />
                    </Form.Item>
                </div>
            )}
        </>
        )}
      </Form>
      
      {testResult && (
          <Alert
              message={testResult.message}
              type={testResult.type}
              showIcon
              style={{ marginTop: 16 }}
          />
      )}
    </Modal>
  );
};

export default ConnectionModal;