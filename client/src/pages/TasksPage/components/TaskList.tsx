import { useMemo } from 'react';
import TaskFilter from './TaskFilter';
import TaskItem from './TaskItem';
import { useTaskStore } from '@/stores/taskStore';
import { useSectionStore } from '@/stores/sectionStore';
import type { Task } from '@/types/task';
import { Typography, Spin, Empty, Segmented } from 'antd';
import { ProjectOutlined, CalendarOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface GroupedTasks {
  sectionId: string | null;
  sectionName: string;
  tasks: Task[];
}

function TaskList() {
  const { tasks, loading, filters, viewMode, setViewMode } = useTaskStore();
  const { sectionsByListId } = useSectionStore();

  const isDaily = viewMode === 'daily';
  const isLongTerm = viewMode === 'long-term';

  const groupedTasks = useMemo<GroupedTasks[]>(() => {
    if (!filters.listId || filters.sectionId) {
      return [];
    }

    const groupMap = new Map<string | null, GroupedTasks>();

    for (const task of tasks) {
      const key = task.sectionId || null;
      if (!groupMap.has(key)) {
        let sectionName = '未分组';
        if (key && filters.listId) {
          const sections = sectionsByListId[filters.listId];
          if (sections) {
            const found = sections.find((s) => s.id === key);
            if (found) sectionName = found.name;
          }
        }
        groupMap.set(key, { sectionId: key, sectionName, tasks: [] });
      }
      groupMap.get(key)!.tasks.push(task);
    }

    return Array.from(groupMap.values());
  }, [tasks, filters.listId, filters.sectionId, sectionsByListId]);

  const headerIcon = isDaily ? (
    <CalendarOutlined style={{ color: '#3B82F6' }} />
  ) : (
    <ProjectOutlined style={{ color: '#8B5CF6' }} />
  );

  const headerTitle = isDaily ? '每日任务' : '长期任务';
  const headerDesc = isDaily
    ? '今日待办，从长期任务中选取'
    : '持久性目标，可跟踪章节进度';
  const emptyDesc = isDaily
    ? '暂无每日任务，点击右上角新建或从长期任务选取'
    : '暂无长期任务，点击右上角新建';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {headerIcon}
          <Text strong style={{ fontSize: 16 }}>{headerTitle}</Text>
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {headerDesc}
        </Text>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <Segmented
          value={viewMode}
          onChange={(val) => setViewMode(val as 'daily' | 'long-term')}
          options={[
            { label: '每日任务', value: 'daily', icon: <CalendarOutlined /> },
            { label: '长期任务', value: 'long-term', icon: <ProjectOutlined /> },
          ]}
        />
      </div>

      <TaskFilter />
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : tasks.length === 0 ? (
        <Empty
          description={emptyDesc}
          style={{ marginTop: 40 }}
        />
      ) : groupedTasks.length > 0 ? (
        <div style={{ marginTop: 16 }}>
          {groupedTasks.map((group) => (
            <div key={group.sectionId ?? '__ungrouped__'} style={{ marginBottom: 16 }}>
              <div
                style={{
                  padding: '6px 0',
                  marginBottom: 8,
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text strong style={{ fontSize: 14 }}>
                  {group.sectionName}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({group.tasks.length}个任务)
                </Text>
              </div>
              {group.tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;

