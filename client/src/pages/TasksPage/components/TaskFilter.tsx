import { Space, Select, Button, Input, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useState } from 'react';
import TaskForm from './TaskForm';
import type { TaskFormValues } from './TaskForm';
import SelectLongTermModal from './SelectLongTermModal';

function TaskFilter() {
  const { filters, setFilters, fetchTasks, createTask, viewMode } = useTaskStore();
  const [formOpen, setFormOpen] = useState(false);
  const [selectLongTermOpen, setSelectLongTermOpen] = useState(false);

  const isDaily = viewMode === 'daily';

  const handleStatusChange = (value: string) => {
    setFilters({ status: value });
    fetchTasks();
  };

  const handlePriorityChange = (value: string) => {
    setFilters({ priority: value });
    fetchTasks();
  };

  const handleSearch = (value: string) => {
    setFilters({ keyword: value });
    fetchTasks();
  };

  const handleCreate = async (values: TaskFormValues) => {
    try {
      await createTask({
        ...values,
        isLongTerm: isDaily ? false : true,
        dueDate: values.dueDate || undefined,
        sourceTaskId: values.sourceTaskId || undefined,
      });
      setFormOpen(false);
    } catch {
      message.error('创建任务失败，请检查网络连接');
    }
  };

  const buttonLabel = isDaily ? '新建每日任务' : '新建长期任务';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Space>
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 120 }}
          value={filters.status || undefined}
          onChange={handleStatusChange}
          options={[
            { value: 'TODO', label: '待处理' },
            { value: 'IN_PROGRESS', label: '进行中' },
            { value: 'DONE', label: '已完成' },
          ]}
        />
        <Select
          placeholder="优先级"
          allowClear
          style={{ width: 100 }}
          value={filters.priority || undefined}
          onChange={handlePriorityChange}
          options={[
            { value: 'HIGH', label: '高' },
            { value: 'MEDIUM', label: '中' },
            { value: 'LOW', label: '低' },
          ]}
        />
        <Input
          placeholder="搜索任务..."
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          allowClear
          onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
        />
      </Space>
      <Space>
        {isDaily && (
          <Button icon={<PlusOutlined />} onClick={() => setSelectLongTermOpen(true)}>
            从长期任务选取
          </Button>
        )}
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          {buttonLabel}
        </Button>
      </Space>
      <TaskForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onFinish={handleCreate}
        isLongTerm={!isDaily}
      />
      <SelectLongTermModal
        open={selectLongTermOpen}
        onCancel={() => setSelectLongTermOpen(false)}
      />
    </div>
  );
}

export default TaskFilter;
