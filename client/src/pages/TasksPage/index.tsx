import { useEffect, useState } from 'react';
import { Button, Drawer, Grid } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import ListSidebar from './components/ListSidebar';
import TaskList from './components/TaskList';
import { useListStore } from '@/stores/listStore';
import { useTaskStore } from '@/stores/taskStore';

const { useBreakpoint } = Grid;

function TasksPage() {
  const fetchLists = useListStore((s) => s.fetchLists);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const [listDrawerOpen, setListDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    fetchLists();
    fetchTasks();
  }, [fetchLists, fetchTasks]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Desktop: show sidebar inline */}
      {!isMobile && <ListSidebar />}

      {/* Mobile: show sidebar in drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={listDrawerOpen}
          onClose={() => setListDrawerOpen(false)}
          width={280}
          styles={{ body: { padding: 0 } }}
          title="清单筛选"
        >
          <ListSidebar />
        </Drawer>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? 12 : 24 }}>
        {isMobile && (
          <div style={{ marginBottom: 12 }}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setListDrawerOpen(true)}
              block
            >
              清单筛选
            </Button>
          </div>
        )}
        <TaskList />
      </div>
    </div>
  );
}

export default TasksPage;
