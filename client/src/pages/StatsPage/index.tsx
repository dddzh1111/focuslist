import { useEffect, useState, useCallback } from 'react';
import { Typography, DatePicker } from 'antd';
import OverviewCards from './components/OverviewCards';
import DailyChart from './components/DailyChart';
import TaskDistribution from './components/TaskDistribution';
import ListProgress from './components/ListProgress';
import LongTermChapterProgress from './components/LongTermChapterProgress';
import * as statsApi from '@/api/stats';
import type { OverviewStats, DailyStatsItem } from '@/api/stats';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function StatsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyStatsItem[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'day'),
    dayjs(),
  ]);

  const fetchDailyData = useCallback((start: string, end: string) => {
    statsApi.getDaily(start, end).then((res) => setDailyData(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    statsApi.getOverview().then((res) => setOverview(res.data)).catch(console.error);
    const start = dateRange[0].format('YYYY-MM-DD');
    const end = dateRange[1].format('YYYY-MM-DD');
    fetchDailyData(start, end);
  }, [dateRange, fetchDailyData]);

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            专注统计
          </Title>
          <Text type="secondary">追踪你的专注时间和任务完成情况</Text>
        </div>
        <RangePicker
          value={dateRange}
          onChange={(dates) => handleDateRangeChange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
          allowClear={false}
          style={{ minWidth: 240 }}
        />
      </div>

      <OverviewCards data={overview} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <DailyChart data={dailyData} />
        <TaskDistribution />
      </div>

      <ListProgress />

      <LongTermChapterProgress />
    </div>
  );
}

export default StatsPage;
