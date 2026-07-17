import { Card, InputNumber, Switch, Typography, Space, Divider } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useSettingsStore } from '@/stores/settingsStore';

const { Text } = Typography;

function PomodoroSettings() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          <span>番茄计时设置</span>
        </Space>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>专注时长（分钟）</Text>
          <InputNumber
            min={5}
            max={120}
            value={settings.focusDuration}
            onChange={(val) => val && updateSettings({ focusDuration: val })}
            style={{ width: 100 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>短休息时长（分钟）</Text>
          <InputNumber
            min={1}
            max={30}
            value={settings.shortBreakDuration}
            onChange={(val) => val && updateSettings({ shortBreakDuration: val })}
            style={{ width: 100 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>长休息时长（分钟）</Text>
          <InputNumber
            min={5}
            max={60}
            value={settings.longBreakDuration}
            onChange={(val) => val && updateSettings({ longBreakDuration: val })}
            style={{ width: 100 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>长休息间隔（个番茄后）</Text>
          <InputNumber
            min={2}
            max={10}
            value={settings.longBreakInterval}
            onChange={(val) => val && updateSettings({ longBreakInterval: val })}
            style={{ width: 100 }}
          />
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>自动开始休息</Text>
          <Switch
            checked={settings.autoStartBreak}
            onChange={(val) => updateSettings({ autoStartBreak: val })}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>自动开始专注</Text>
          <Switch
            checked={settings.autoStartFocus}
            onChange={(val) => updateSettings({ autoStartFocus: val })}
          />
        </div>
      </div>
    </Card>
  );
}

export default PomodoroSettings;
