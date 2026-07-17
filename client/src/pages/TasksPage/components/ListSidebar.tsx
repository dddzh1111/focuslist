import { useEffect, useState, useCallback } from 'react';
import { Button, Typography, Space, Spin, Input, Popconfirm } from 'antd';
import { PlusOutlined, RightOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons';
import { useListStore } from '@/stores/listStore';
import { useTaskStore } from '@/stores/taskStore';
import { useSectionStore } from '@/stores/sectionStore';
import ListForm, { type ListFormValues } from './ListForm';

const { Text } = Typography;

function ListSidebar() {
  const { lists, loading, createList, deleteList } = useListStore();
  const { filters, setFilters, fetchTasks } = useTaskStore();
  const { sectionsByListId, fetchSections, createSection } = useSectionStore();

  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [addingSectionFor, setAddingSectionFor] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [listFormOpen, setListFormOpen] = useState(false);

  const handleSelectList = (listId: string | null) => {
    setFilters({ listId: listId || undefined, sectionId: undefined });
    if (listId) {
      setExpandedListId(listId);
    } else {
      setExpandedListId(null);
    }
    fetchTasks();
  };

  const handleSelectSection = (sectionId: string | null) => {
    setFilters({ sectionId: sectionId || undefined });
    fetchTasks();
  };

  const handleToggleExpand = (listId: string) => {
    if (expandedListId === listId) {
      setExpandedListId(null);
    } else {
      setExpandedListId(listId);
      const sections = sectionsByListId[listId];
      if (!sections) {
        fetchSections(listId);
      }
    }
  };

  const handleAddSection = async () => {
    if (addingSectionFor && newSectionName.trim()) {
      await createSection(addingSectionFor, newSectionName.trim());
      setNewSectionName('');
      setAddingSectionFor(null);
    }
  };

  const handleCreateList = async (values: ListFormValues) => {
    await createList({
      name: values.name.trim(),
      color: values.color || '#3B82F6',
    });
    setListFormOpen(false);
  };

  const handleDeleteList = async (listId: string) => {
    await deleteList(listId);
    if (filters.listId === listId) {
      setFilters({ listId: undefined, sectionId: undefined });
      fetchTasks();
    }
  };

  const sectionsForExpanded = expandedListId ? sectionsByListId[expandedListId] || [] : [];

  return (
    <div
      style={{
        width: 240,
        borderRight: '1px solid var(--color-border)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text strong>清单</Text>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setListFormOpen(true)}>
          新建
        </Button>
      </div>
      {loading ? (
        <Spin size="small" />
      ) : (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <div
            onClick={() => handleSelectList(null)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              background: !filters.listId ? '#EFF6FF' : 'transparent',
              color: !filters.listId ? '#3B82F6' : 'var(--color-text)',
            }}
          >
            全部任务
          </div>
          {lists.map((list) => (
            <div key={list.id}>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: filters.listId === list.id ? '#EFF6FF' : 'transparent',
                  color: filters.listId === list.id ? '#3B82F6' : 'var(--color-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  onClick={() => handleToggleExpand(list.id)}
                  style={{ cursor: 'pointer', fontSize: 10, flexShrink: 0 }}
                >
                  {expandedListId === list.id ? <DownOutlined /> : <RightOutlined />}
                </span>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: list.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{ flex: 1 }}
                  onClick={() => handleSelectList(list.id)}
                >
                  {list.name}
                </span>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {list._count?.tasks ?? 0}
                </Text>
                <Popconfirm
                  title={`删除清单"${list.name}"？`}
                  description="删除清单会同时删除该清单下的全部任务，确定吗？"
                  onConfirm={() => handleDeleteList(list.id)}
                  okText="确定"
                  cancelText="取消"
                  placement="right"
                  getPopupContainer={(node) => node.parentElement || document.body}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    title="删除清单及全部任务"
                  />
                </Popconfirm>
              </div>
              {expandedListId === list.id && (
                <div style={{ paddingLeft: 24 }}>
                  {/* 未分组 */}
                  <div
                    onClick={() => handleSelectSection(null)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 13,
                      color: !filters.sectionId ? '#3B82F6' : 'var(--color-text-secondary)',
                      background: !filters.sectionId ? '#EFF6FF' : 'transparent',
                    }}
                  >
                    未分组
                  </div>
                  {sectionsForExpanded.map((section) => (
                    <div
                      key={section.id}
                      onClick={() => handleSelectSection(section.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 13,
                        color: filters.sectionId === section.id ? '#3B82F6' : 'var(--color-text-secondary)',
                        background: filters.sectionId === section.id ? '#EFF6FF' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{section.name}</span>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {section._count?.tasks ?? 0}
                      </Text>
                    </div>
                  ))}
                  {/* 新增 Section */}
                  {addingSectionFor === list.id ? (
                    <div style={{ padding: '6px 0' }}>
                      <Input
                        size="small"
                        placeholder="单元名称"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        onPressEnter={handleAddSection}
                        onBlur={() => {
                          if (!newSectionName.trim()) setAddingSectionFor(null);
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setAddingSectionFor(list.id)}
                      style={{
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      + 新增单元
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </Space>
      )}
      <ListForm open={listFormOpen} onCancel={() => setListFormOpen(false)} onFinish={handleCreateList} />
    </div>
  );
}

export default ListSidebar;


