import { usePomodoroStore } from '@/stores/pomodoroStore';

function SessionProgress() {
  const { currentSession, totalSessions, phase, settings } = usePomodoroStore();
  const focusCount = Math.min(currentSession, totalSessions);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
        {phase === 'focus'
          ? `第 ${currentSession} 个番茄`
          : `已完成 ${Math.max(0, currentSession - (phase === 'idle' ? 1 : 0))} 个番茄`}
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: totalSessions }).map((_, i) => {
          const completed =
            phase === 'focus'
              ? i < currentSession - 1
              : i < Math.max(0, currentSession - (phase === 'idle' ? 1 : 0));

          return (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: completed ? '#3B82F6' : 'var(--color-border)',
                transition: 'background 0.3s',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default SessionProgress;
