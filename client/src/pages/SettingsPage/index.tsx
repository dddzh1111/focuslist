import { useEffect, useState } from 'react';
import { Typography, Card } from 'antd';
import PomodoroSettings from './components/PomodoroSettings';
import AudioSettings from './components/AudioSettings';
import ThemeSettings from './components/ThemeSettings';
import { useSettingsStore } from '@/stores/settingsStore';

const { Title, Text } = Typography;

function SettingsPage() {
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>
          设置
        </Title>
        <Text type="secondary">自定义你的专注体验</Text>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
        <PomodoroSettings />
        <AudioSettings />
        <ThemeSettings />
      </div>
    </div>
  );
}

export default SettingsPage;
