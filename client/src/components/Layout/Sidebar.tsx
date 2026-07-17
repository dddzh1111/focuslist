import { useLocation, Link } from 'react-router-dom';
import { Menu } from 'antd';
import {
  CheckSquareOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

interface SidebarProps {
  onClickItem?: () => void;
}

function Sidebar({ onClickItem }: SidebarProps) {
  const location = useLocation();
  const selectedKey = '/' + location.pathname.split('/')[1];

  const handleClick = () => {
    onClickItem?.();
  };

  const menuItems = [
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: <Link to="/tasks" onClick={handleClick}>任务</Link>,
    },
    {
      key: '/pomodoro',
      icon: <ClockCircleOutlined />,
      label: <Link to="/pomodoro" onClick={handleClick}>番茄</Link>,
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: <Link to="/calendar" onClick={handleClick}>日历</Link>,
    },
    {
      key: '/stats',
      icon: <BarChartOutlined />,
      label: <Link to="/stats" onClick={handleClick}>统计</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings" onClick={handleClick}>设置</Link>,
    },
  ];

  return <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems} style={{ border: 'none' }} />;
}

export default Sidebar;
