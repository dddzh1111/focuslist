import { Select, Typography } from 'antd';
import { usePomodoroStore } from '@/stores/pomodoroStore';
import { useTaskStore } from '@/stores/taskStore';
import { useEffect } from 'react';

const { Text } = Typography;

function TaskSelector() {
  const { currentTaskId, selectTask, phase } = usePomodoroStore();
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks({ pageSize: 100 });
  }, [fetchTasks]);

  const isIdle = phase === 'idle';

  return (
    <div style={{ width: 320, textAlign: 'center' }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        选择专注任务
      </Text>
      <Select
        showSearch
        placeholder="选择任务开始专注"
        value={currentTaskId}
        onChange={(val) => {
          const task = tasks.find((t) => t.id === val);
          selectTask(val, task?.estimatedPomos);
        }}
        disabled={!isIdle}
        style={{ width: '100%' }}
        options={tasks
          .filter((t) => t.status !== 'DONE')
          .map((t) => ({
            value: t.id,
            label: t.title,
          }))}
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
      />
    </div>
  );
}

export default TaskSelector;
