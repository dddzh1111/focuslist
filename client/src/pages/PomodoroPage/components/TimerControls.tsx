import { Space, Button } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ForwardOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { usePomodoroStore } from '@/stores/pomodoroStore';

function TimerControls() {
  const { phase, isRunning, isPaused, start, pause, resume, skip, stop } = usePomodoroStore();

  const isIdle = phase === 'idle';

  return (
    <Space size="middle">
      {isIdle || isPaused ? (
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={isPaused ? resume : start}
          style={{ height: 48, paddingInline: 32, borderRadius: 24 }}
        >
          开始
        </Button>
      ) : (
        <Button
          size="large"
          icon={<PauseCircleOutlined />}
          onClick={pause}
          style={{ height: 48, paddingInline: 32, borderRadius: 24 }}
        >
          暂停
        </Button>
      )}

      <Button
        size="large"
        icon={<ForwardOutlined />}
        onClick={skip}
        disabled={isIdle}
        style={{ borderRadius: 24 }}
      >
        跳过
      </Button>

      <Button
        size="large"
        danger
        icon={<StopOutlined />}
        onClick={stop}
        disabled={isIdle}
        style={{ borderRadius: 24 }}
      >
        停止
      </Button>
    </Space>
  );
}

export default TimerControls;
