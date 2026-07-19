import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Checkbox, Tag, Typography, Button, Space, Popconfirm, Modal, message, Progress, Grid } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CaretRightOutlined,
  CheckOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useSectionStore } from '@/stores/sectionStore';
import type { Task } from '@/types/task';
import TaskForm, { type TaskFormValues } from './TaskForm';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const priorityConfig: Record<string, { color: string; label: string }> = {
  HIGH: { color: '#EF4444', label: '高' },
  MEDIUM: { color: '#F59E0B', label: '中' },
  LOW: { color: '#22C55E', label: '低' },
};

const statusConfig: Record<string, string> = {
  TODO: '待处理',
  IN_PROGRESS: '进行中',
  DONE: '已完成',
};

interface TaskItemProps {
  task: Task;
}

function TaskItem({ task }: TaskItemProps) {
  const { updateStatus, deleteTask, updateTask, selectFromLongTerm, filters, viewMode } = useTaskStore();
  const { sectionsByListId } = useSectionStore();
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const done = task.status === 'DONE';
  const isLongTerm = task.isLongTerm;
  const isDailyView = viewMode === 'daily';

  const completions: number[] = Array.isArray(task.chapterCompletions)
    ? task.chapterCompletions
    : [];

  const handleStatusToggle = () => {
    const nextStatus = done ? 'TODO' : 'DONE';
    updateStatus(task.id, nextStatus);
  };

  const handleEdit = async (values: TaskFormValues) => {
    try {
      await updateTask(task.id, {
        ...values,
        dueDate: values.dueDate || undefined,
      });
      setEditOpen(false);
    } catch {
      message.error('更新失败');
    }
  };

  const handleSelectToday = async () => {
    try {
      const nextChapter = task.completedChapters + 1;
      await selectFromLongTerm(task.id, { chapterIndex: nextChapter });
      message.success(`已将"${task.title}"第${nextChapter}章加入今日任务`);
    } catch {
      message.error('选取失败，请重试');
    }
  };

  let sectionName = '';
  if (task.sectionId && filters.listId) {
    const sections = sectionsByListId[filters.listId];
    if (sections) {
      const found = sections.find((s) => s.id === task.sectionId);
      if (found) sectionName = found.name;
    }
  }

  const chapterProgress = isLongTerm && task.totalChapters > 0
    ? Math.round((task.completedChapters / task.totalChapters) * 100)
    : 0;

  const editInitialValues: Partial<TaskFormValues> = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate || undefined,
    estimatedPomos: task.estimatedPomos,
    listId: task.listId || undefined,
    sectionId: task.sectionId || undefined,
    totalChapters: task.totalChapters || undefined,
  };

  const cardPadding = isMobile ? '10px 12px' : '12px 16px';
  const titleFontSize = isMobile ? 14 : 15;
  const gapSize = isMobile ? 8 : 12;

  return (
    <>
      <Card
        size="small"
        style={{
          marginBottom: isMobile ? 6 : 8,
          opacity: done ? 0.6 : 1,
          border: isLongTerm ? '1px solid #8B5CF6' : '1px solid var(--color-border)',
          borderLeft: isLongTerm ? '3px solid #8B5CF6' : undefined,
          transition: 'all 0.2s ease',
          borderRadius: isMobile ? 8 : 8,
        }}
        bodyStyle={{ padding: cardPadding }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: gapSize }}>
          <Checkbox checked={done} onChange={handleStatusToggle} style={{ marginTop: 2, flexShrink: 0 }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: isMobile ? 4 : 4 }}>
              <Text
                delete={done}
                style={{
                  fontWeight: 500,
                  fontSize: titleFontSize,
                  color: done ? 'var(--color-text-muted)' : 'var(--color-text)',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {task.title}
              </Text>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: isMobile ? 6 : 6 }}>
              {isLongTerm && (
                <Tag color="purple" style={{ margin: 0, fontSize: 11, padding: '0 6px' }}>长期</Tag>
              )}
              {!isLongTerm && task.sourceTask && (
                <Tag color="blue" style={{ margin: 0, fontSize: 11, padding: '0 6px' }}>
                  来源: {task.sourceTask.title}
                </Tag>
              )}
              {sectionName && (
                <Tag color="blue" style={{ margin: 0, fontSize: 11, padding: '0 6px' }}>
                  {sectionName}
                </Tag>
              )}
              <Tag color={priorityConfig[task.priority]?.color} style={{ margin: 0, fontSize: 11, padding: '0 6px' }}>
                {priorityConfig[task.priority]?.label}
              </Tag>
              <Tag style={{ margin: 0, fontSize: 11, padding: '0 6px' }}>{statusConfig[task.status]}</Tag>
            </div>

            {isLongTerm && task.totalChapters > 0 && (
              <div style={{ marginTop: 4, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Progress
                  percent={chapterProgress}
                  size="small"
                  strokeColor="#8B5CF6"
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                  {task.completedChapters}/{task.totalChapters} 章
                </Text>
              </div>
            )}

            {!isLongTerm && task.description && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginTop: 2,
                  marginBottom: 4,
                  lineHeight: 1.5,
                }}
              >
                {task.description}
              </Text>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16, marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                🍅 {task.completedPomos}/{task.estimatedPomos || '-'}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                ⏱ {Math.floor(task.totalFocusTime / 60)}分钟
              </Text>
            </div>

            {isMobile && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                {isDailyView && !isLongTerm && (
                  <>
                    <Button
                      type="primary"
                      size="small"
                      icon={<CaretRightOutlined />}
                      onClick={() => navigate(`/pomodoro?taskId=${task.id}`)}
                      disabled={done}
                      style={{ flex: 1, fontSize: 12 }}
                    >
                      专注
                    </Button>
                    <Button
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={handleStatusToggle}
                      style={{ flex: 1, fontSize: 12, color: done ? undefined : '#22C55E', borderColor: done ? undefined : '#22C55E' }}
                    >
                      {done ? '撤销' : '完成'}
                    </Button>
                  </>
                )}
                {(!isDailyView || isLongTerm) && isLongTerm && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleSelectToday}
                    style={{ flex: 1, fontSize: 12 }}
                  >
                    选到今日
                  </Button>
                )}
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => setDetailOpen(true)}
                  style={{ flex: 1, fontSize: 12 }}
                >
                  详情
                </Button>
                <Popconfirm
                  title={isLongTerm ? '删除长期任务' : '删除任务'}
                  description="删除后将无法恢复，确定删除吗？"
                  onConfirm={() => deleteTask(task.id)}
                  okText="确定"
                  cancelText="取消"
                  getPopupContainer={(node) => node.parentElement || document.body}
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    style={{ flex: 1, fontSize: 12 }}
                  >
                    删除
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>

          {!isMobile && (
            <Space size="small" direction="vertical" style={{ flexShrink: 0 }}>
              {isDailyView && !isLongTerm && (
                <>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CaretRightOutlined />}
                    onClick={() => navigate(`/pomodoro?taskId=${task.id}`)}
                    title="开始专注"
                    disabled={done}
                  >
                    执行
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={handleStatusToggle}
                    title={done ? '标记为未完成' : '标记完成'}
                    style={{ color: done ? undefined : '#22C55E' }}
                  />
                  <Popconfirm
                    title="删除任务"
                    description="确定删除此每日任务吗？"
                    onConfirm={() => deleteTask(task.id)}
                    okText="确定"
                    cancelText="取消"
                    getPopupContainer={(node) => node.parentElement || document.body}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      title="删除"
                    />
                  </Popconfirm>
                </>
              )}

              {(!isDailyView || isLongTerm) && isLongTerm && (
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleSelectToday}
                  title="选取到今天"
                  style={{ color: '#3B82F6' }}
                />
              )}

              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setDetailOpen(true)}
                title="查看详情"
              />
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setEditOpen(true)}
                title="编辑"
              />
              <Popconfirm
                title={isLongTerm ? '删除长期任务' : '删除任务'}
                description="删除后将无法恢复，确定删除吗？"
                onConfirm={() => deleteTask(task.id)}
                okText="确定"
                cancelText="取消"
                getPopupContainer={(node) => node.parentElement || document.body}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  title="删除"
                />
              </Popconfirm>
            </Space>
          )}
        </div>
      </Card>

      <TaskForm
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onFinish={handleEdit}
        initialValues={editInitialValues}
      />

      <Modal
        title="任务详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={isMobile ? '90vw' : 480}
        style={isMobile ? { top: 20 } : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>标题</Text>
            <div style={{ fontWeight: 500, fontSize: 15 }}>{task.title}</div>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>描述</Text>
            <div>{task.description || '-'}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>优先级</Text>
              <div>{priorityConfig[task.priority]?.label}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>状态</Text>
              <div>{statusConfig[task.status]}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>预估番茄</Text>
              <div>{task.estimatedPomos || '-'}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>已完成番茄</Text>
              <div>{task.completedPomos}</div>
            </div>
          </div>
          {isLongTerm && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>章节进度</Text>
              <div>
                {task.completedChapters}/{task.totalChapters} ({chapterProgress}%)
              </div>
              {task.totalChapters > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {Array.from({ length: task.totalChapters }, (_, i) => {
                    const ch = i + 1;
                    const isDone = completions.includes(ch);
                    return (
                      <div
                        key={ch}
                        style={{
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: isDone ? '#f0e6ff' : '#f5f5f5',
                          border: isDone ? '1px solid #8B5CF6' : '1px solid #e0e0e0',
                          color: isDone ? '#8B5CF6' : '#999',
                        }}
                      >
                        {isDone ? '✓' : ''} {ch}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>总专注时长</Text>
            <div>{Math.floor(task.totalFocusTime / 60)} 分钟</div>
          </div>
          {task.dueDate && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>截止日期</Text>
              <div>{task.dueDate}</div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default TaskItem;
