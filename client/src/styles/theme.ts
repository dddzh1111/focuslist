import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#3B82F6',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',
    borderRadius: 8,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F8FAFC',
    colorBorder: '#E2E8F0',
  },
  components: {
    Layout: {
      siderBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      bodyBg: '#F8FAFC',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#EFF6FF',
      itemSelectedColor: '#3B82F6',
      itemHoverBg: '#F1F5F9',
      itemColor: '#64748B',
      itemHeight: 44,
      iconSize: 18,
      collapsedIconSize: 18,
    },
    Card: {
      paddingLG: 20,
    },
    Button: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Table: {
      headerBg: '#F8FAFC',
    },
  },
};
