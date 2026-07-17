import { Card, Empty } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import * as statsApi from '@/api/stats';
import type { ListStats } from '@/api/stats';

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function TaskDistribution() {
  const [data, setData] = useState<ListStats[]>([]);

  useEffect(() => {
    statsApi.getByList().then((res) => setData(res.data)).catch(console.error);
  }, []);

  const chartData = data.map((item) => ({
    name: item.listName,
    value: Math.round(item.totalFocusSec / 60),
  }));

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
