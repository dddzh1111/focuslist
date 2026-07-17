import { Drawer, List, Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { useTaskStore } from '@/stores/taskStore';
import MiniTaskItem from './MiniTaskItem';
import ShortTaskForm, { type ShortTaskFormValues } from './ShortTaskForm';

interface DayDetailProps {
  date: string | null;
  onClose: () => void;
}

function DayDetail({ date, onClose }: DayDetailProps) {
  const { tasksByDate, fetchCalendarData } = useCalendarStore();
  const { createTask } = useTaskStore();
  const tasks = date ? tasksByDate[date] || [] : [];
  const [formOpen, setFormOpen] = useState(false);

  const handleCreateShortTask = async (values: ShortTaskFormValues) => {
    if (!date) return;
    await createTask({
      ...values,
      isLongTerm: false,
      dueDate: date,
    });
    setFormOpen(false);
    await fetchCalendarData();
  };

  return (
    <Drawer
      title={date ? `${date} 任务` : '任务详情'}
      open={!!date}
      onClose={onClose}
      width={400}
      footer={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={() => setFormOpen(true)}
        >
          新增短期任务
        </Button>
      }
    >
      {tasks.length === 0 ? (
        <Empty description="当天无任务" />
      ) : (
        <List
          dataSource={tasks}
          renderItem={(task) => <MiniTaskItem key={task.id} task={task} />}
        />
      )}
      <ShortTaskForm
        open={formOpen}
        dueDate={date || ''}
        onCancel={() => setFormOpen(false)}
        onFinish={handleCreateShortTask}
      />
    </Drawer>
  );
}

export default DayDetail;

