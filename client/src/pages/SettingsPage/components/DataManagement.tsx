import { useState, useRef } from 'react';
import { Card, Button, Space, Typography, Popconfirm, message, Upload } from 'antd';
import { ExportOutlined, ImportOutlined, DeleteOutlined, CloudOutlined } from '@ant-design/icons';
import { useTaskStore } from '@/stores/taskStore';
import { usePomodoroStore } from '@/stores/pomodoroStore';
import { useListStore } from '@/stores/listStore';
import { useSectionStore } from '@/stores/sectionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSleepStore } from '@/stores/sleepStore';

const { Title, Text } = Typography;

function DataManagement() {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const taskState = useTaskStore.getState();
    const pomodoroState = usePomodoroStore.getState();
    const listState = useListStore.getState();
    const sectionState = useSectionStore.getState();
    const settingsState = useSettingsStore.getState();
    const sleepState = useSleepStore.getState();

    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: taskState.tasks,
      pomodoros: pomodoroState.pomodoros,
      pomodoroSettings: pomodoroState.settings,
      lists: listState.lists,
      sectionsByListId: sectionState.sectionsByListId,
      settings: settingsState.settings,
      sleepRecords: sleepState.records,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focuslist-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('数据导出成功');
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version) {
        throw new Error('无效的备份文件格式');
      }

      if (data.tasks !== undefined) {
        useTaskStore.setState({ tasks: data.tasks });
      }
      if (data.pomodoros !== undefined) {
        usePomodoroStore.setState({ pomodoros: data.pomodoros });
      }
      if (data.pomodoroSettings !== undefined) {
        usePomodoroStore.setState({ settings: data.pomodoroSettings });
      }
      if (data.lists !== undefined) {
        useListStore.setState({ lists: data.lists });
      }
      if (data.sectionsByListId !== undefined) {
        useSectionStore.setState({ sectionsByListId: data.sectionsByListId });
      }
      if (data.settings !== undefined) {
        useSettingsStore.setState({ settings: data.settings });
      }
      if (data.sleepRecords !== undefined) {
        useSleepStore.setState({ records: data.sleepRecords });
      }

      message.success('数据导入成功');
    } catch (err) {
      message.error('导入失败：文件格式不正确');
      console.error(err);
    } finally {
      setImporting(false);
    }
    return false;
  };

  const handleClearData = () => {
    useTaskStore.setState({ tasks: [] });
    usePomodoroStore.setState({ pomodoros: [] });
    useListStore.setState({ lists: [] });
    useSectionStore.setState({ sectionsByListId: {} });
    useSleepStore.setState({ records: [] });
    message.success('数据已清空');
  };

  return (
    <Card
      title={
        <Space>
          <CloudOutlined style={{ color: '#8B5CF6' }} />
          <Title level={5} style={{ margin: 0 }}>
            数据管理
          </Title>
        </Space>
      }
      style={{ borderRadius: 12 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          管理你的本地数据，可以导出备份或导入之前的备份文件。
        </Text>

        <Space wrap>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExport}
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              border: 'none',
              borderRadius: 8,
            }}
          >
            导出数据
          </Button>

          <Upload
            accept=".json"
            showUploadList={false}
            beforeUpload={handleImport}
            disabled={importing}
          >
            <Button
              icon={<ImportOutlined />}
              loading={importing}
              style={{ borderRadius: 8 }}
            >
              导入数据
            </Button>
          </Upload>

          <Popconfirm
            title="清空所有数据"
            description="确定要清空所有数据吗？此操作不可撤销，建议先导出备份。"
            onConfirm={handleClearData}
            okText="确定清空"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }}>
              清空数据
            </Button>
          </Popconfirm>
        </Space>

        <div
          style={{
            padding: 12,
            background: '#FEF3C7',
            borderRadius: 8,
            fontSize: 12,
            color: '#92400E',
          }}
        >
          <Text strong style={{ color: '#92400E' }}>
            💡 提示：
          </Text>
          {' '}所有数据都保存在浏览器本地（localStorage），清除浏览器数据会导致数据丢失，建议定期导出备份。
        </div>
      </div>
    </Card>
  );
}

export default DataManagement;
