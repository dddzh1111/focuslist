import { Card, Tag } from 'antd';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types/task';

const priorityConfig: Record<string, { color: string; label: string }> = {
  HIGH: { color: '#EF4444', label: '高' },
  MEDIUM: { color: '#F59E0B', label: '中' },
  LOW: { color: '#22C55E', label: '低' },
};

interface MiniTaskItemProps {
  task: Task;
}

function MiniTaskItem({ task }: MiniTaskItemProps) {
  const { updateStatus } = useTaskStore();
  const done = task.status === 'DONE';

  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        opacity: done ? 0.5 : 1,
        border: done ? '1px solid #E2E8F0' : '1px solid var(--color-border)',
        cursor: 'pointer',
      }}
      bodyStyle={{ padding: '10px 12px' }}
      onClick={() => {
        const nextStatus = done ? 'TODO' : 'DONE';
        updateStatus(task.id, nextStatus);
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            textDecoration: done ? 'line-through' : 'none',
            color: done ? 'var(--color-text-muted)' : 'var(--color-text)',
            flex: 1,
            fontSize: 13,
          }}
        >
          {task.title}
        </span>
        <Tag color={priorityConfig[task.priority]?.color} style={{ margin: 0, fontSize: 11 }}>
          {priorityConfig[task.priority]?.label}
        </Tag>
      </div>
    </Card>
  );
}

export default MiniTaskItem;
