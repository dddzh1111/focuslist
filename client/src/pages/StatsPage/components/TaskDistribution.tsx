import { Card, Empty } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';
import { usePomodoroStore } from '@/stores/pomodoroStore';
import { useTaskStore } from '@/stores/taskStore';
import { useListStore } from '@/stores/listStore';

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function TaskDistribution() {
  const { pomodoros } = usePomodoroStore();
  const { tasks } = useTaskStore();
  const { lists } = useListStore();

  const chartData = useMemo(() => {
    const listFocusTime: Record<string, number> = {};

    pomodoros.forEach((p) => {
      if (!p.completed) return;
      const task = tasks.find((t) => t.id === p.taskId);
      if (task && task.listId) {
        listFocusTime[task.listId] = (listFocusTime[task.listId] || 0) + p.duration;
      }
    });

    return lists
      .map((list) => ({
        name: list.name,
        value: Math.round((listFocusTime[list.id] || 0) / 60),
      }))
      .filter((item) => item.value > 0);
  }, [pomodoros, tasks, lists]);

  return (
    <Card title="清单专注分布">
      {chartData.length === 0 ? (
        <Empty description="暂无数据" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} 分钟`, '专注时长']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export default TaskDistribution;
