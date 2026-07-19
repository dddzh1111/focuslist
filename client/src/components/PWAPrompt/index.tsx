import { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRegisterSW } from 'virtual:pwa-register/react';

function PWAPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PWA: Service Worker 已注册');
    },
    onRegisterError(error) {
      console.error('PWA: Service Worker 注册失败', error);
    },
    onNeedRefresh() {
      setNeedRefresh(true);
      message.info('发现新版本，点击刷新更新');
    },
    onOfflineReady() {
      setOfflineReady(true);
      message.success('应用已准备好离线使用');
    },
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      message.success('应用已添加到主屏幕');
    }
    setInstallPrompt(null);
  };

  const handleUpdate = async () => {
    await updateServiceWorker(true);
  };

  if (showInstall) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: '90vw',
        }}
      >
        <span style={{ fontSize: 14, whiteSpace: 'nowrap' }}>📱 添加到桌面</span>
        <Button
          type="primary"
          size="small"
          icon={<DownloadOutlined />}
          onClick={handleInstall}
          style={{
            background: '#fff',
            color: '#6366F1',
            border: 'none',
            fontWeight: 500,
          }}
        >
          安装
        </Button>
      </div>
    );
  }

  if (needRefresh) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: '90vw',
        }}
      >
        <span style={{ fontSize: 14, whiteSpace: 'nowrap' }}>✨ 发现新版本</span>
        <Button
          type="primary"
          size="small"
          icon={<ReloadOutlined />}
          onClick={handleUpdate}
          style={{
            background: '#fff',
            color: '#22C55E',
            border: 'none',
            fontWeight: 500,
          }}
        >
          更新
        </Button>
      </div>
    );
  }

  return null;
}

export default PWAPrompt;
