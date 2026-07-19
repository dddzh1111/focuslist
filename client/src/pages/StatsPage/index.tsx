import { useEffect, useState, useCallback, useMemo } from 'react';
import { Typography, DatePicker } from 'antd';
import OverviewCards from './components/OverviewCards';
import DailyChart from './components/DailyChart';
import TaskDistribution from './components/TaskDistribution';
import ListProgress from './components/ListProgress';
import LongTermChapterProgress from './components/LongTermChapterProgress';
import { usePomodoroStore } from '@/stores/pomodoroStore';
import { useTaskStore } from '@/stores/taskStore';
import type { OverviewStats, DailyStatsItem } from '@/api/stats';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function calculateOverviewStats(): OverviewStats {
  const pomodoroStore = usePomodoroStore.getState();
  const taskStore = useTaskStore.getState();

  const completedPomodoros = pomodoroStore.pomodoros.filter((p) => p.completed);
  const totalFocusSec = completedPomodoros.reduce((sum, p) => sum + p.duration, 0);

  const completedTasks = taskStore.tasks.filter((t) => t.status === 'DONE');
  const longTermTasks = taskStore.tasks.filter((t) => t.isLongTerm);
  const completedShortTasks = completedTasks.filter((t) => !t.isLongTerm);

  let longTermTotalChapters = 0;
  let longTermCompletedChapters = 0;
  longTermTasks.forEach((t) => {
    longTermTotalChapters += t.totalChapters;
    longTermCompletedChapters += t.completedChapters;
  });

  const longTermProgress =
    longTermTotalChapters > 0
      ? Math.round((longTermCompletedChapters / longTermTotalChapters) * 100)
      : 0;

  return {
    totalPomodoros: completedPomodoros.length,
    totalFocusSec,
    totalFocusHours: (totalFocusSec / 3600).toFixed(1),
    completedTasks: completedTasks.length,
    longTermTasks: longTermTasks.length,
    longTermTotalChapters,
    longTermCompletedChapters,
    longTermProgress,
    completedShortTasks: completedShortTasks.length,
  };
}

function calculateDailyStats(start: string, end: string): DailyStatsItem[] {
  const pomodoroStore = usePomodoroStore.getState();
  const taskStore = useTaskStore.getState();

  const result: DailyStatsItem[] = [];
  let current = dayjs(start);
  const endDay = dayjs(end);

  while (current.isBefore(endDay) || current.isSame(endDay, 'day')) {
    const dateStr = current.format('YYYY-MM-DD');

    const dayPomodoros = pomodoroStore.pomodoros.filter(
      (p) => p.completed && dayjs(p.startTime).isSame(dateStr, 'day')
    );
    const totalFocusSec = dayPomodoros.reduce((sum, p) => sum + p.duration, 0);

    const dayTasks = taskStore.tasks.filter(
      (t) => t.completedAt && dayjs(t.completedAt).isSame(dateStr, 'day')
    );

    const interruptedPomos = pomodoroStore.pomodoros.filter(
      (p) => p.interruptedAt && dayjs(p.startTime).isSame(dateStr, 'day')
    ).length;

    result.push({
      date: dateStr,
      totalFocusSec,
      completedPomos: dayPomodoros.length,
      completedTasks: dayTasks.length,
      interruptedPomos,
    });

    current = current.add(1, 'day');
  }

  return result;
}

function StatsPage() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'day'),
    dayjs(),
  ]);

  const { pomodoros } = usePomodoroStore();
  const { tasks } = useTaskStore();

  const overview = useMemo(() => calculateOverviewStats(), [pomodoros, tasks]);

  const dailyData = useMemo(() => {
    const start = dateRange[0].format('YYYY-MM-DD');
    const end = dateRange[1].format('YYYY-MM-DD');
    return calculateDailyStats(start, end);
  }, [dateRange, pomodoros, tasks]);

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
