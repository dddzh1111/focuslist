import app from './app';
import { env } from './config/env';
import { startCleanupScheduler } from './services/cleanup.service';

// 启动每日任务自动清理（每天00:00）
startCleanupScheduler();

app.listen(env.PORT, () => {
  console.log(`[FocusList Server] 运行在 http://localhost:${env.PORT}`);
  console.log(`[FocusList Server] 环境: ${env.NODE_ENV}`);
});
