import { useState, useEffect, useCallback } from 'react';
import { Modal, List, InputNumber, Button, Typography, Tag, Space, message, Spin, Empty } from 'antd';
import { PlusOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useTaskStore } from '@/stores/taskStore';
import * as taskApi from '@/api/tasks';
import type { Task } from '@/types/task';

const { Text } = Typography;

interface SelectLongTermModalProps {
  open: boolean;
  onCancel: () => void;
}

function SelectLongTermModal({ open, onCancel }: SelectLongTermModalProps) {
  const { selectFromLongTerm } = useTaskStore();
  const [longTermTasks, setLongTermTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchLongTermTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskApi.getTasks({ isLongTerm: 'true', pageSize: 100 });
      setLongTermTasks(res.data);
    } catch {
      message.error('获取长期任务失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchLongTermTasks();
      setSelectedChapter({});
    }
  }, [open, fetchLongTermTasks]);

  const handleSelect = async (task: Task) => {
    setSubmitting(task.id);
    try {
      const chapter = selectedChapter[task.id];
      const nextChapter = task.completedChapters + 1;
      const defaultChapter = chapter || nextChapter;
      await selectFromLongTerm(task.id, {
        chapterIndex: defaultChapter,
      });
      message.success(`已将"${task.title}"第${defaultChapter}章加入今日任务`);
      onCancel();
    } catch {
      message.error('选取失败，请重试');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Modal
      title="从长期任务选取"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={560}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : longTermTasks.length === 0 ? (
        <Empty description="暂无长期任务，请先创建" />
      ) : (
        <List
          dataSource={longTermTasks}
          renderItem={(task) => {
            const completions: number[] = Array.isArray(task.chapterCompletions)
              ? task.chapterCompletions
              : [];
            const nextChapter = task.completedChapters + 1;
            const defaultChapter = nextChapter > task.totalChapters ? 1 : nextChapter;

            return (
              <List.Item
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text strong style={{ fontSize: 14 }}>{task.title}</Text>
                      <Tag color="purple" style={{ margin: 0 }}>
                        {task.totalChapters}章
                      </Tag>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      loading={submitting === task.id}
                      onClick={() => handleSelect(task)}
                    >
                      选取
                    </Button>
                  </div>

                  {/* 章节勾选框 */}
                  {task.totalChapters > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      {Array.from({ length: task.totalChapters }, (_, i) => {
                        const ch = i + 1;
                        const isDone = completions.includes(ch);
                        return (
                          <div
                            key={ch}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 12,
                              padding: '2px 7px',
                              borderRadius: 4,
                              background: isDone ? '#f0e6ff' : '#f5f5f5',
                              cursor: 'pointer',
                              border: isDone ? '1px solid #8B5CF6' : '1px solid #e0e0e0',
                              color: isDone ? '#8B5CF6' : '#666',
                              userSelect: 'none',
                              transition: 'all 0.15s',
                            }}
                          >
                            {isDone && (
                              <CheckCircleFilled style={{ fontSize: 11 }} />
                            )}
                            <span>{ch}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 设置要学习的章节 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      今天学第
                    </Text>
                    <InputNumber
                      size="small"
                      min={1}
                      max={task.totalChapters || 999}
                      value={selectedChapter[task.id] ?? defaultChapter}
                      onChange={(v) =>
                        setSelectedChapter((prev) => ({
                          ...prev,
                          [task.id]: v ?? defaultChapter,
                        }))
                      }
                      style={{ width: 64 }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      章 (当前进度 {task.completedChapters}/{task.totalChapters})
                    </Text>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Modal>
  );
}

export default SelectLongTermModal;
