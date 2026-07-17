import { useState } from 'react';
import { Card, Progress, Typography, Tag, Empty, Spin, message } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { useTaskStore } from '@/stores/taskStore';

const { Text, Title } = Typography;

function LongTermChapterProgress() {
  const { tasks, loading, toggleChapter } = useTaskStore();
  const [togglingChapters, setTogglingChapters] = useState<Record<string, number>>({});

  const longTermTasks = tasks.filter((t) => t.isLongTerm);

  const handleChapterToggle = async (taskId: string, chapterIndex: number, completed: boolean) => {
    const key = `${taskId}-${chapterIndex}`;
    setTogglingChapters((prev) => ({ ...prev, [key]: chapterIndex }));
    try {
      await toggleChapter(taskId, chapterIndex, !completed);
    } catch {
      message.error('切换章节状态失败');
    } finally {
      setTogglingChapters((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (longTermTasks.length === 0) {
    return (
      <Card style={{ marginTop: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          长期任务章节进度
        </Title>
        <Empty description="暂无长期任务" />
      </Card>
    );
  }

  return (
    <Card style={{ marginTop: 24 }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        长期任务章节进度
      </Title>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {longTermTasks.map((task) => {
          const allDone = task.completedChapters >= task.totalChapters;
          const chapterProgress =
            task.totalChapters > 0
              ? Math.round((task.completedChapters / task.totalChapters) * 100)
              : 0;

          return (
            <Card
              key={task.id}
              size="small"
              style={{
                border: allDone
                  ? '1px solid #22C55E'
                  : '1px solid #8B5CF6',
                borderLeft: allDone
                  ? '3px solid #22C55E'
                  : '3px solid #8B5CF6',
                background: allDone ? '#F0FDF4' : undefined,
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: '16px' }}
            >
              {/* 任务标题 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong style={{ fontSize: 15 }}>
                    {task.title}
                  </Text>
                  <Tag color="purple" style={{ margin: 0 }}>
                    长期
                  </Tag>
                  {allDone && (
                    <Tag color="success" style={{ margin: 0 }}>
                      全部完成
                    </Tag>
                  )}
                </div>
              </div>

              {/* 进度条 */}
              {task.totalChapters > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <Progress
                    percent={chapterProgress}
                    size="small"
                    strokeColor={allDone ? '#22C55E' : '#8B5CF6'}
                    style={{ flex: 1, maxWidth: 260, marginBottom: 0 }}
                  />
                  <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {task.completedChapters}/{task.totalChapters} 章
                  </Text>
                </div>
              )}

              {/* 章节勾选框网格 */}
              {task.totalChapters > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {Array.from({ length: task.totalChapters }, (_, i) => {
                    const chapterNum = i + 1;
                    const isDone = task.chapterCompletions.includes(chapterNum);
                    const togglingKey = `${task.id}-${chapterNum}`;
                    const isToggling = togglingKey in togglingChapters;

                    return (
                      <div
                        key={chapterNum}
                        onClick={() =>
                          handleChapterToggle(task.id, chapterNum, isDone)
                        }
                        title={
                          isToggling
                            ? '更新中...'
                            : isDone
                            ? `第${chapterNum}章（已完成）- 点击取消`
                            : `第${chapterNum}章 - 点击完成`
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          minWidth: 40,
                          height: 32,
                          padding: '0 10px',
                          borderRadius: 6,
                          cursor: isToggling ? 'wait' : 'pointer',
                          background: isDone
                            ? '#EDE9FE'
                            : '#F3F4F6',
                          border: isDone
                            ? '1.5px solid #8B5CF6'
                            : '1.5px solid #E5E7EB',
                          color: isDone ? '#7C3AED' : '#9CA3AF',
                          fontWeight: isDone ? 600 : 400,
                          fontSize: 13,
                          opacity: isToggling ? 0.6 : 1,
                          transition: 'all 0.2s ease',
                          userSelect: 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (!isToggling) {
                            (e.currentTarget as HTMLDivElement).style.transform =
                              'scale(1.08)';
                            (e.currentTarget as HTMLDivElement).style.boxShadow =
                              '0 2px 8px rgba(139, 92, 246, 0.25)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.transform =
                            'scale(1)';
                          (e.currentTarget as HTMLDivElement).style.boxShadow =
                            'none';
                        }}
                      >
                        {isToggling ? (
                          <Spin size="small" />
                        ) : isDone ? (
                          <CheckCircleFilled style={{ fontSize: 12 }} />
                        ) : null}
                        {chapterNum}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

export default LongTermChapterProgress;
