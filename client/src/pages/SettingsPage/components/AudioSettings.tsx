import { Card, Select, Slider, Typography, Space } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { useSettingsStore } from '@/stores/settingsStore';

const { Text } = Typography;

function AudioSettings() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <Card
      title={
        <Space>
          <SoundOutlined />
          <span>音频设置</span>
        </Space>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text>白噪音</Text>
          <Select
            value={settings.whiteNoise}
            onChange={(val) => updateSettings({ whiteNoise: val })}
            style={{ width: 160 }}
            options={[
              { value: 'none', label: '无' },
              { value: 'rain', label: '雨声' },
              { value: 'forest', label: '森林' },
              { value: 'cafe', label: '咖啡馆' },
            ]}
          />
        </div>
        <div>
          <Text>音量</Text>
          <Slider
            min={0}
            max={100}
            value={settings.volume}
            onChange={(val) => updateSettings({ volume: val })}
            style={{ marginTop: 8 }}
          />
        </div>
      </div>
    </Card>
  );
}

export default AudioSettings;
