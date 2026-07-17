import { Card, Statistic, Row, Col, Progress } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  ProjectOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { OverviewStats } from '@/api/stats';

interface OverviewCardsProps {
  data: OverviewStats | null;
}

function formatMinutes(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}分钟`;
}

function OverviewCards({ data }: OverviewCardsProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="总专注时长"
            value={data ? formatMinutes(data.totalFocusSec) : '--'}
            prefix={<ClockCircleOutlined style={{ color: '#3B82F6' }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="完成番茄数"
            value={data?.totalPomodoros ?? '--'}
            prefix={<ThunderboltOutlined style={{ color: '#F59E0B' }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="完成任务数"
            value={data?.completedTasks ?? '--'}
            prefix={<CheckCircleOutlined style={{ color: '#22C55E' }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="短期任务完成"
            value={data?.completedShortTasks ?? '--'}
            prefix={<CalendarOutlined style={{ color: '#8B5CF6' }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="长期任务数"
            value={data?.longTermTasks ?? '--'}
            prefix={<ProjectOutlined style={{ color: '#8B5CF6' }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <div style={{ marginBottom: 4, fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>长期任务进度</div>
          {data ? (
            <>
              <Progress
                percent={data.longTermProgress}
                size="small"
                strokeColor="#8B5CF6"
                style={{ marginBottom: 4 }}
              />
              <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>
                章节 {data.longTermCompletedChapters}/{data.longTermTotalChapters}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.25)' }}>--</div>
          )}
        </Card>
      </Col>
    </Row>
  );
}

export default OverviewCards;
