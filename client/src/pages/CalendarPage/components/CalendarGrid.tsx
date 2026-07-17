import dayjs from 'dayjs';
import { useCalendarStore } from '@/stores/calendarStore';
import DayCell from './DayCell';
import DayDetail from './DayDetail';
import { useState, useMemo } from 'react';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function CalendarGrid() {
  const { viewMode, currentDate } = useCalendarStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => {
    const d = dayjs(currentDate);
    const daysArray: dayjs.Dayjs[] = [];

    if (viewMode === 'month') {
      const startOfMonth = d.startOf('month');
      const startDay = startOfMonth.day();
      // 从月视图起始日（周日）开始计算
      for (let i = 0; i < startDay; i++) {
        daysArray.push(startOfMonth.subtract(startDay - i, 'day'));
      }
      const daysInMonth = d.daysInMonth();
      for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push(startOfMonth.date(i));
      }
      // 填充到完整行
      const remaining = 7 - (daysArray.length % 7);
      if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
          daysArray.push(startOfMonth.add(daysInMonth + i - 1, 'day'));
        }
      }
    } else if (viewMode === 'week') {
      const startOfWeek = d.startOf('week');
      for (let i = 0; i < 7; i++) {
        daysArray.push(startOfWeek.add(i, 'day'));
      }
    } else {
      daysArray.push(d);
    }

    return daysArray;
  }, [viewMode, currentDate]);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <>
      <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {/* 星期头部 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid var(--color-border)',
            background: '#F8FAFC',
          }}
        >
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              style={{
                padding: '10px 0',
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
              }}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
          }}
        >
          {days.map((day, idx) => (
            <DayCell
              key={idx}
              date={day}
              isCurrentMonth={day.month() === dayjs(currentDate).month() || viewMode !== 'month'}
              onClick={handleDayClick}
            />
          ))}
        </div>
      </div>

      <DayDetail date={selectedDate} onClose={() => setSelectedDate(null)} />
    </>
  );
}

export default CalendarGrid;
