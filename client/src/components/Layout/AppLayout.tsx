import { useState } from 'react';
import { Layout, Drawer, Button, Grid } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md; // md breakpoint is 768px

  const sidebarContent = (
    <>
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#3B82F6',
            whiteSpace: 'nowrap',
          }}
        >
          FocusList
        </span>
      </div>
      <Sidebar onClickItem={() => setMobileMenuOpen(false)} />
    </>
  );

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={220}
          style={{
            borderRight: '1px solid var(--color-border)',
            background: '#FFFFFF',
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          width={240}
          styles={{ body: { padding: 0 } }}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            height: 56,
            background: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            padding: isMobile ? '0 12px' : '0 24px',
            gap: 12,
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
            />
          )}
          <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            {isMobile ? 'FocusList' : '清单番茄 - 任务驱动专注'}
          </span>
        </Header>
        <Content style={{ overflow: 'auto' }}>{children}</Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
