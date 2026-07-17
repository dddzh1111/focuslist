import { Card, Typography, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailyStatsItem } from '@/api/stats';

const { Text } = Typography;

interface DailyChartProps {
  data: DailyStatsItem[];
}

function formatMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

function DailyChart({ data }: DailyChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    minutes: formatMinutes(item.totalFocusSec),
    dateLabel: item.date.slice(5),
  }));

  return (
    <Card title="每日专注趋势">
      {chartData.length === 0 ? (
        <Empty description="暂无数据" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" label={{ value: '分钟', position: 'insideLeft', style: { fontSize: 12 } }} />
            <Tooltip
              formatter={(value: number) => [`${value} 分钟`, '专注时长']}
              contentStyle={{ borderRadius: 8 }}
            />
            <Bar dataKey="minutes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export default DailyChart;
