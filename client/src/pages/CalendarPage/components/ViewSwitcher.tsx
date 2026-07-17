import { Button, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useCalendarStore } from '@/stores/calendarStore';

interface ViewSwitcherProps {
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function ViewSwitcher({ onToday, onPrev, onNext }: ViewSwitcherProps) {
  const { viewMode, setViewMode } = useCalendarStore();

  const modes: { key: 'month' | 'week' | 'day'; label: string }[] = [
    { key: 'month', label: '月' },
    { key: 'week', label: '周' },
    { key: 'day', label: '日' },
  ];

  return (
    <Space>
      <Button size="small" onClick={onToday}>
        今天
      </Button>
      <Button size="small" icon={<LeftOutlined />} onClick={onPrev} />
      <Button size="small" icon={<RightOutlined />} onClick={onNext} />
      <Space.Compact>
        {modes.map((m) => (
          <Button
            key={m.key}
            size="small"
            type={viewMode === m.key ? 'primary' : 'default'}
            onClick={() => setViewMode(m.key)}
          >
            {m.label}
          </Button>
        ))}
      </Space.Compact>
    </Space>
  );
}

export default ViewSwitcher;
