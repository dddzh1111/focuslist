import { Button, Space, Typography } from 'antd';
import { usePomodoroStore } from '@/stores/pomodoroStore';

const { Text } = Typography;

const PRESETS = [15, 25, 30, 45];

function DurationSelector() {
  const { settings, phase, updateSettings, resetTimer } = usePomodoroStore();
  const isIdle = phase === 'idle';

  const handleChange = (minutes: number) => {
    updateSettings({ focusDuration: minutes });
    if (isIdle) {
      resetTimer();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Text type="secondary" style={{ fontSize: 13 }}>专注时长：</Text>
      <Space size="small">
        {PRESETS.map((min) => (
          <Button
            key={min}
            size="small"
            type={settings.focusDuration === min ? 'primary' : 'default'}
            onClick={() => handleChange(min)}
            style={{ borderRadius: 16, minWidth: 44 }}
          >
            {min}分
          </Button>
        ))}
      </Space>
    </div>
  );
}

export default DurationSelector;
