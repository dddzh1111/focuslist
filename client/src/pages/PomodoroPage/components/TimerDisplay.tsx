import { usePomodoroStore } from '@/stores/pomodoroStore';
import { Progress } from 'antd';

function TimerDisplay() {
  const { timeLeft, progress, isRunning, phase } = usePomodoroStore();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const strokeColor =
    phase === 'focus' ? '#3B82F6' : phase === 'shortBreak' ? '#22C55E' : '#F59E0B';

  const trailColor = phase === 'focus' ? '#EFF6FF' : '#F0FDF4';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Progress
        type="circle"
        percent={Math.round(progress * 100)}
        format={() => ''}
        strokeColor={strokeColor}
        trailColor={trailColor}
        strokeWidth={8}
        size={280}
      />
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 56,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: phase === 'focus' ? '#1E293B' : '#374151',
          }}
        >
          {timeStr}
        </span>
        <span
          style={{
            fontSize: 14,
            color: strokeColor,
            marginTop: 4,
            minHeight: 20,
          }}
        >
          {isRunning ? '运行中...' : phase === 'idle' ? '点击开始' : '已暂停'}
        </span>
      </div>
    </div>
  );
}

export default TimerDisplay;
