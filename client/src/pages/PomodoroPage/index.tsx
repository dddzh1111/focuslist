import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Typography, notification } from 'antd';
import TimerDisplay from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import TaskSelector from './components/TaskSelector';
import SessionProgress from './components/SessionProgress';
import DurationSelector from './components/DurationSelector';
import { usePomodoroStore } from '@/stores/pomodoroStore';
import { useTaskStore } from '@/stores/taskStore';

const { Title, Text } = Typography;

function PomodoroPage() {
  const { phase, currentTaskId, selectTask, tick, timeLeft, updateSettings, resetTimer } = usePomodoroStore();
  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchTasks({ pageSize: 100 });
  }, [fetchTasks]);

  // 从 URL query 获取 taskId 并自动选择
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId && taskId !== currentTaskId && phase === 'idle') {
      const task = tasks.find((t) => t.id === taskId);
      // 如果任务设了自定义番茄时长，先更新设置
      if (task?.focusDuration && task.focusDuration > 0) {
        updateSettings({ focusDuration: task.focusDuration });
      }
      selectTask(taskId, task?.estimatedPomos);
    }
  }, [searchParams, currentTaskId, selectTask, updateSettings, phase, tasks]);

  // 计时器引擎
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // 当 timeLeft 归零时，tick 内部已处理完成和切换，这里额外显示通知
  useEffect(() => {
    if (timeLeft === 0 && phase === 'focus') {
      notification.success({
        message: '番茄完成！',
        description: '专注阶段已完成，休息一下吧！',
        placement: 'topRight',
        duration: 4,
      });
    }
  }, [timeLeft, phase]);

  const phaseLabel =
    phase === 'focus'
      ? '专注中'
      : phase === 'shortBreak'
        ? '短休息'
        : phase === 'longBreak'
          ? '长休息'
          : '准备就绪';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 24,
        gap: 24,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Title level={3} style={{ margin: 0, color: phase === 'focus' ? '#3B82F6' : '#22C55E' }}>
          {phaseLabel}
        </Title>
        {currentTaskId && (
          <Text type="secondary">当前任务已关联</Text>
        )}
      </div>

      <TaskSelector />

      <TimerDisplay />

      <DurationSelector />

      <TimerControls />

      <SessionProgress />
    </div>
  );
}

export default PomodoroPage;
