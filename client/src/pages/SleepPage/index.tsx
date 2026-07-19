import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  TimePicker,
  DatePicker,
  Select,
  Input,
  Space,
  List,
  Tag,
  Modal,
  message,
  Popconfirm,
  Grid,
  Statistic,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  MoonOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RiseOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import {
  getSleepRecords,
  createSleepRecord,
  updateSleepRecord,
  deleteSleepRecord,
  getSleepStats,
} from '@/api/sleep';
import type { SleepRecord, SleepStats } from '@/types/sleep';
import { qualityConfig } from '@/types/sleep';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

interface SleepFormData {
  date: Dayjs;
  sleepTime: Dayjs;
  wakeTime?: Dayjs;
  quality?: 'GREAT' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
}

function SleepPage() {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);
  const [formData, setFormData] = useState<SleepFormData>({
    date: dayjs(),
    sleepTime: dayjs().subtract(1, 'day').hour(23).minute(0),
  });
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, statsRes] = await Promise.all([
        getSleepRecords({ pageSize: 30 }),
        getSleepStats(),
      ]);
      if (recordsRes.success && recordsRes.data) {
        setRecords(recordsRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch {
      message.error('加载睡眠记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setFormData({
      date: dayjs(),
      sleepTime: dayjs().subtract(1, 'day').hour(23).minute(0),
      wakeTime: dayjs().hour(7).minute(0),
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (record: SleepRecord) => {
    setEditingRecord(record);
    setFormData({
      date: dayjs(record.date),
      sleepTime: dayjs(record.sleepTime),
      wakeTime: record.wakeTime ? dayjs(record.wakeTime) : undefined,
      quality: record.quality,
      notes: record.notes,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingRecord) {
        await updateSleepRecord(editingRecord.id, {
          sleepTime: formData.sleepTime.toISOString(),
          wakeTime: formData.wakeTime?.toISOString(),
          quality: formData.quality,
          notes: formData.notes,
        });
        message.success('更新成功');
      } else {
        await createSleepRecord({
          date: formData.date.format('YYYY-MM-DD'),
          sleepTime: formData.sleepTime.toISOString(),
          wakeTime: formData.wakeTime?.toISOString(),
          quality: formData.quality,
          notes: formData.notes,
        });
        message.success('打卡成功！');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      message.error(editingRecord ? '更新失败' : '打卡失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSleepRecord(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  const avgDuration = stats?.avgDurationMinutes || 0;

  const latestNoWake = records.find((r) => !r.wakeTime);

  const handleQuickSleep = async () => {
    try {
      const now = dayjs();
      const wakeDate = now.hour() < 12 ? now : now.add(1, 'day');
      await createSleepRecord({
        date: wakeDate.format('YYYY-MM-DD'),
        sleepTime: now.toISOString(),
      });
      message.success('已记录入睡时间，晚安~ 🌙');
      fetchData();
    } catch {
      message.error('记录失败');
    }
  };

  const handleQuickWake = async () => {
    if (!latestNoWake) return;
    try {
      await updateSleepRecord(latestNoWake.id, {
        wakeTime: dayjs().toISOString(),
      });
      message.success('起床打卡成功！☀️');
      fetchData();
    } catch {
      message.error('打卡失败');
    }
  };

  return (
    <div style={{ padding: isMobile ? 12 : 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? 16 : 20,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MoonOutlined style={{ fontSize: isMobile ? 22 : 26, color: '#8B5CF6' }} />
          <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
            睡眠打卡
          </Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          size={isMobile ? 'middle' : 'large'}
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
            border: 'none',
            borderRadius: 12,
          }}
        >
          记录睡眠
        </Button>
      </div>

      <Row gutter={isMobile ? [8, 8] : [16, 16]} style={{ marginBottom: isMobile ? 16 : 20 }}>
        <Col xs={12}>
          <Button
            block
            size="large"
            icon={<MoonOutlined />}
            onClick={handleQuickSleep}
            style={{
              height: isMobile ? 48 : 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: '#fff',
              border: 'none',
              fontSize: isMobile ? 14 : 15,
              fontWeight: 500,
            }}
          >
            🌙 开始睡觉
          </Button>
        </Col>
        <Col xs={12}>
          <Button
            block
            size="large"
            icon={<RiseOutlined />}
            onClick={handleQuickWake}
            disabled={!latestNoWake}
            style={{
              height: isMobile ? 48 : 56,
              borderRadius: 14,
              background: latestNoWake
                ? 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
                : '#F3F4F6',
              color: latestNoWake ? '#fff' : '#9CA3AF',
              border: 'none',
              fontSize: isMobile ? 14 : 15,
              fontWeight: 500,
            }}
          >
            ☀️ 起床打卡
          </Button>
        </Col>
      </Row>

      <Row gutter={isMobile ? [8, 8] : [16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: isMobile ? 12 : 16 }}
          >
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
                  平均睡眠
                </Text>
              }
              value={avgDuration ? (avgDuration / 60).toFixed(1) : 0}
              suffix="小时"
              valueStyle={{ fontSize: isMobile ? 20 : 24, color: '#3B82F6' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: isMobile ? 12 : 16 }}
          >
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
                  打卡天数
                </Text>
              }
              value={stats?.totalRecords || 0}
              suffix="天"
              valueStyle={{ fontSize: isMobile ? 20 : 24, color: '#22C55E' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: isMobile ? 12 : 16 }}
          >
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
                  累计睡眠
                </Text>
              }
              value={stats ? Math.floor(stats.totalDurationMinutes / 60) : 0}
              suffix="小时"
              valueStyle={{ fontSize: isMobile ? 20 : 24, color: '#8B5CF6' }}
              prefix={<MoonOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              border: 'none',
            }}
            bodyStyle={{ padding: isMobile ? 12 : 16 }}
          >
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: isMobile ? 12 : 13 }}>
                  最佳质量
                </Text>
              }
              value={
                stats && stats.qualityCounts.GREAT > 0
                  ? '很棒'
                  : stats && stats.qualityCounts.GOOD > 0
                    ? '不错'
                    : '-'
              }
              valueStyle={{ fontSize: isMobile ? 20 : 24, color: '#D97706' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={isMobile ? [8, 8] : [16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={24}>
          <Card
            title={
              <Text strong style={{ fontSize: isMobile ? 15 : 16 }}>
                睡眠趋势
              </Text>
            }
            style={{ borderRadius: 12 }}
            bodyStyle={{ padding: isMobile ? 12 : 16 }}
          >
            {records.filter((r) => r.durationMinutes).length === 0 ? (
              <Empty description="暂无数据，记录睡眠后查看趋势" style={{ padding: '30px 0' }} />
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
                <LineChart
                  data={[...records].reverse().filter((r) => r.durationMinutes).map((r) => ({
                    dateLabel: dayjs(r.date).format('MM/DD'),
                    hours: Number((r.durationMinutes! / 60).toFixed(1)),
                    quality: r.quality,
                  }))}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#94A3B8"
                    domain={[0, 'dataMax + 1']}
                    tickFormatter={(val) => `${val}h`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} 小时`, '睡眠时长']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <ReferenceLine y={8} stroke="#22C55E" strokeDasharray="5 5" label={{ value: '推荐8h', position: 'right', fontSize: 10, fill: '#22C55E' }} />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Text strong style={{ fontSize: isMobile ? 15 : 16 }}>
            历史记录
          </Text>
        }
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: isMobile ? 8 : 16 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Empty description="加载中..." />
          </div>
        ) : records.length === 0 ? (
          <Empty
            description="还没有睡眠记录，点击上方按钮开始打卡吧"
            style={{ padding: '40px 0' }}
          />
        ) : (
          <List
            dataSource={records}
            renderItem={(record) => {
              const quality = record.quality ? qualityConfig[record.quality] : null;
              return (
                <List.Item
                  style={{
                    padding: isMobile ? '10px 4px' : '12px 0',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                  actions={
                    isMobile
                      ? [
                          <Button
                            key="edit"
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenEdit(record)}
                          >
                            编辑
                          </Button>,
                          <Popconfirm
                            key="delete"
                            title="删除记录"
                            description="确定删除这条睡眠记录吗？"
                            onConfirm={() => handleDelete(record.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                              删除
                            </Button>
                          </Popconfirm>,
                        ]
                      : undefined
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: isMobile ? 44 : 50,
                          height: isMobile ? 44 : 50,
                          borderRadius: 12,
                          background: quality
                            ? `${quality.color}20`
                            : 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isMobile ? 20 : 24,
                        }}
                      >
                        {quality?.emoji || '😴'}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ fontSize: isMobile ? 14 : 15 }}>
                          {dayjs(record.date).format('MM月DD日')}
                        </Text>
                        {quality && (
                          <Tag color={quality.color} style={{ margin: 0, fontSize: 11 }}>
                            {quality.label}
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div style={{ fontSize: isMobile ? 12 : 13, color: 'var(--color-text-secondary)' }}>
                        <div style={{ marginBottom: 2 }}>
                          入睡 {dayjs(record.sleepTime).format('HH:mm')}
                          {record.wakeTime && (
                            <>
                              {' '}→ 起床 {dayjs(record.wakeTime).format('HH:mm')}
                            </>
                          )}
                        </div>
                        {record.durationMinutes && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            时长: {formatDuration(record.durationMinutes)}
                          </Text>
                        )}
                        {record.notes && (
                          <div style={{ marginTop: 4, color: 'var(--color-text-muted)' }}>
                            💭 {record.notes}
                          </div>
                        )}
                      </div>
                    }
                  />
                  {!isMobile && (
                    <Space>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(record)}
                      >
                        编辑
                      </Button>
                      <Popconfirm
                        title="删除记录"
                        description="确定删除这条睡眠记录吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  )}
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      <Modal
        title={editingRecord ? '编辑睡眠记录' : '记录睡眠'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText="保存"
        cancelText="取消"
        width={isMobile ? '90vw' : 480}
        style={isMobile ? { top: 20 } : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              日期（起床日）
            </Text>
            <DatePicker
              value={formData.date}
              onChange={(date) => date && setFormData({ ...formData, date })}
              style={{ width: '100%' }}
              size="large"
              disabled={!!editingRecord}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                入睡时间
              </Text>
              <TimePicker
                value={formData.sleepTime}
                onChange={(time) => time && setFormData({ ...formData, sleepTime: time })}
                style={{ width: '100%' }}
                size="large"
                format="HH:mm"
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                起床时间
              </Text>
              <TimePicker
                value={formData.wakeTime}
                onChange={(time) => setFormData({ ...formData, wakeTime: time || undefined })}
                style={{ width: '100%' }}
                size="large"
                format="HH:mm"
                allowClear
              />
            </div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              睡眠质量
            </Text>
            <Select
              value={formData.quality}
              onChange={(val) => setFormData({ ...formData, quality: val })}
              style={{ width: '100%' }}
              size="large"
              allowClear
              placeholder="选择睡眠质量"
              options={[
                { value: 'GREAT', label: '😴 很棒' },
                { value: 'GOOD', label: '😊 不错' },
                { value: 'FAIR', label: '😐 一般' },
                { value: 'POOR', label: '😫 不好' },
              ]}
            />
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              备注
            </Text>
            <TextArea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="记录一下今天的睡眠感受..."
              rows={3}
              maxLength={200}
              showCount
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SleepPage;
