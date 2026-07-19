import { Space, Select, Button, Input, message, Grid } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useState } from 'react';
import TaskForm from './TaskForm';
import type { TaskFormValues } from './TaskForm';
import SelectLongTermModal from './SelectLongTermModal';

const { useBreakpoint } = Grid;

function TaskFilter() {
  const { filters, setFilters, fetchTasks, createTask, viewMode } = useTaskStore();
  const [formOpen, setFormOpen] = useState(false);
  const [selectLongTermOpen, setSelectLongTermOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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

  const statusOptions = [
    { value: 'TODO', label: '待处理' },
    { value: 'IN_PROGRESS', label: '进行中' },
    { value: 'DONE', label: '已完成' },
  ];

  const priorityOptions = [
    { value: 'HIGH', label: '高优先' },
    { value: 'MEDIUM', label: '中优先' },
    { value: 'LOW', label: '低优先' },
  ];

  if (isMobile) {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 10 }}>
          <Input
            placeholder="搜索任务..."
            prefix={<SearchOutlined />}
            allowClear
            value={filters.keyword || ''}
            onChange={(e) => handleSearch(e.target.value)}
            size="middle"
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <Select
            placeholder="状态"
            allowClear
            style={{ flex: 1 }}
            value={filters.status || undefined}
            onChange={handleStatusChange}
            options={statusOptions}
            size="middle"
          />
          <Select
            placeholder="优先级"
            allowClear
            style={{ flex: 1 }}
            value={filters.priority || undefined}
            onChange={handlePriorityChange}
            options={priorityOptions}
            size="middle"
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isDaily && (
            <Button
              icon={<PlusOutlined />}
              onClick={() => setSelectLongTermOpen(true)}
              style={{ flex: 1 }}
              size="middle"
            >
              选取任务
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setFormOpen(true)}
            style={{ flex: 1 }}
            size="middle"
          >
            {isDaily ? '新建任务' : '新建长期'}
          </Button>
        </div>

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

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <Space size="middle">
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 120 }}
          value={filters.status || undefined}
          onChange={handleStatusChange}
          options={statusOptions}
        />
        <Select
          placeholder="优先级"
          allowClear
          style={{ width: 110 }}
          value={filters.priority || undefined}
          onChange={handlePriorityChange}
          options={priorityOptions}
        />
        <Input
          placeholder="搜索任务..."
          prefix={<SearchOutlined />}
          style={{ width: 220 }}
          allowClear
          value={filters.keyword || ''}
          onChange={(e) => handleSearch(e.target.value)}
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
