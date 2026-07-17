import { useEffect } from 'react';
import { Typography } from 'antd';
import ViewSwitcher from './components/ViewSwitcher';
import CalendarGrid from './components/CalendarGrid';
import { useCalendarStore } from '@/stores/calendarStore';
import { useListStore } from '@/stores/listStore';

const { Title, Text } = Typography;

function CalendarPage() {
  const { viewMode, currentDate, goToToday, goToPrev, goToNext, fetchCalendarData } =
    useCalendarStore();
  const { fetchLists } = useListStore();

  useEffect(() => {
    fetchCalendarData();
    fetchLists();
  }, [fetchCalendarData, fetchLists]);

  // 格式化显示当前日期范围
  const today = new Date(currentDate);
  let dateLabel = '';
  if (viewMode === 'month') {
    dateLabel = `${today.getFullYear()}年 ${today.getMonth() + 1}月`;
  } else if (viewMode === 'week') {
    dateLabel = `${today.getFullYear()}年 ${today.getMonth() + 1}月 第${Math.ceil(today.getDate() / 7)}周`;
  } else {
    dateLabel = `${today.getFullYear()}年 ${today.getMonth() + 1}月 ${today.getDate()}日`;
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            日历视图
          </Title>
          <Text type="secondary">{dateLabel}</Text>
        </div>
        <ViewSwitcher onToday={goToToday} onPrev={goToPrev} onNext={goToNext} />
      </div>
      <CalendarGrid />
    </div>
  );
}

export default CalendarPage;

