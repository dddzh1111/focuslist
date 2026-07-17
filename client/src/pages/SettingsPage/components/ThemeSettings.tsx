import { Card, Space } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';

const PRESET_COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#F59E0B',
  '#22C55E',
  '#06B6D4',
  '#6366F1',
];

function ThemeSettings() {
  return (
    <Card
      title={
        <Space>
          <BgColorsOutlined />
          <span>主题设置</span>
        </Space>
      }
    >
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {PRESET_COLORS.map((color) => (
          <div
            key={color}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: color,
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'transform 0.15s, border-color 0.15s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
            }}
          />
        ))}
      </div>
    </Card>
  );
}

export default ThemeSettings;
