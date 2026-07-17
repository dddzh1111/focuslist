import dayjs from 'dayjs';
import { Badge, Typography, Tooltip } from 'antd';
import { useCalendarStore } from '@/stores/calendarStore';

const { Text } = Typography;

interface DayCellProps {
  date: dayjs.Dayjs;
  isCurrentMonth: boolean;
  onClick: (date: string) => void;
}

function DayCell({ date, isCurrentMonth, onClick }: DayCellProps) {
  const { tasksByDate } = useCalendarStore();
  const dateStr = date.format('YYYY-MM-DD');
  const isToday = dateStr === dayjs().format('YYYY-MM-DD');

  const tasks = tasksByDate[dateStr] || [];
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div
      onClick={() => onClick(dateStr)}
      style={{
        minHeight: 100,
        padding: 8,
        borderRight: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        cursor: 'pointer',
        opacity: isCurrentMonth ? 1 : 0.35,
        background: isToday ? '#EFF6FF' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isToday) (e.currentTarget as HTMLDivElement).style.background = '#F8FAFC';
      }}
      onMouseLeave={(e) => {
        if (!isToday) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text
          strong
          style={{
            fontSize: 14,
            color: isToday ? '#3B82F6' : 'var(--color-text)',
          }}
        >
          {date.date()}
        </Text>
        {total > 0 && (
          <Badge
            count={total}
            size="small"
            style={{
              backgroundColor: doneCount === total ? '#22C55E' : '#3B82F6',
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
        {tasks.slice(0, 4).map((task) => (
          <Tooltip key={task.id} title={task.title}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                lineHeight: '18px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                color: task.status === 'DONE' ? '#9CA3AF' : task.priority === 'HIGH' ? '#EF4444' : 'var(--color-text)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: task.list?.color || (task.status === 'DONE' ? '#9CA3AF' : '#3B82F6'),
                }}
              />
              {task.title}
            </div>
          </Tooltip>
        ))}
        {tasks.length > 4 && (
          <Text type="secondary" style={{ fontSize: 10 }}>
            +{tasks.length - 4} 更多
          </Text>
        )}
      </div>
    </div>
  );
}

export default DayCell;
