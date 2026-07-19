import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import TasksPage from './pages/TasksPage';
import PomodoroPage from './pages/PomodoroPage';
import CalendarPage from './pages/CalendarPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import SleepPage from './pages/SleepPage';
import PWAPrompt from './components/PWAPrompt';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/pomodoro" element={<PomodoroPage />} />
        <Route path="/sleep" element={<SleepPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <PWAPrompt />
    </AppLayout>
  );
}

export default App;
