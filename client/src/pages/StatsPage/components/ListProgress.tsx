import { Card, Progress, Collapse, Typography, Tag, Empty, Spin } from 'antd';
import { useMemo } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useListStore } from '@/stores/listStore';
import { useSectionStore } from '@/stores/sectionStore';
import type { ListProgress as ListProgressType, SectionProgress } from '@/types/stats';

const { Text, Title } = Typography;

function ListProgress() {
  const { tasks } = useTaskStore();
  const { lists } = useListStore();
  const { sectionsByListId } = useSectionStore();

  const data = useMemo<ListProgressType[]>(() => {
    return lists.map((list) => {
      const listTasks = tasks.filter((t) => t.listId === list.id);
      const doneTasks = listTasks.filter((t) => t.status === 'DONE');
      const inProgressTasks = listTasks.filter((t) => t.status === 'IN_PROGRESS');
      const todoTasks = listTasks.filter((t) => t.status === 'TODO');
      const completionRate =
        listTasks.length > 0 ? Math.round((doneTasks.length / listTasks.length) * 100) : 0;

      const sections = sectionsByListId[list.id] || [];
      const sectionProgresses: SectionProgress[] = sections.map((section) => {
        const sectionTasks = listTasks.filter((t) => t.sectionId === section.id);
        const doneSectionTasks = sectionTasks.filter((t) => t.status === 'DONE');
        return {
          sectionId: section.id,
          name: section.name,
          totalTasks: sectionTasks.length,
          doneTasks: doneSectionTasks.length,
          completionRate:
            sectionTasks.length > 0
              ? Math.round((doneSectionTasks.length / sectionTasks.length) * 100)
              : 0,
        };
      });

      return {
        listId: list.id,
        listName: list.name,
        color: list.color,
        totalTasks: listTasks.length,
        doneTasks: doneTasks.length,
        inProgressTasks: inProgressTasks.length,
        todoTasks: todoTasks.length,
        completionRate,
        sections: sectionProgresses,
      };
    });
  }, [tasks, lists, sectionsByListId]);

  if (data.length === 0) {
    return <Empty description="暂无清单数据" />;
  }

  const collapseItems = data.map((list) => ({
    key: list.listId,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: list.color,
            flexShrink: 0,
          }}
        />
        <Text strong style={{ flex: 1 }}>
          {list.listName}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {list.doneTasks}/{list.totalTasks} 完成
        </Text>
        <Progress
          percent={list.completionRate}
          size="small"
          style={{ width: 120, marginBottom: 0 }}
          strokeColor={list.color}
        />
      </div>
    ),
    children: (
      <div>
        <div style={{ marginBottom: 12, display: 'flex', gap: 16 }}>
          <Tag color="green">已完成: {list.doneTasks}</Tag>
          <Tag color="blue">进行中: {list.inProgressTasks}</Tag>
          <Tag>待处理: {list.todoTasks}</Tag>
        </div>
        {list.sections.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
              单元完成情况
            </Text>
            {list.sections.map((section) => (
              <div
                key={section.sectionId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <Text style={{ width: 100, fontSize: 13 }}>{section.name}</Text>
                <Progress
                  percent={section.completionRate}
                  size="small"
                  style={{ flex: 1, marginBottom: 0 }}
                  strokeColor={list.color}
                />
                <Text type="secondary" style={{ fontSize: 12, width: 60, textAlign: 'right' }}>
                  {section.doneTasks}/{section.totalTasks}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <Card style={{ marginTop: 24 }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        清单进度
      </Title>
      <Collapse
        items={collapseItems}
        size="small"
        ghost
        expandIconPosition="end"
      />
    </Card>
  );
}

export default ListProgress;
