import cron from 'node-cron';
import prisma from '../lib/prisma';

export function startCleanupScheduler() {
  // 每天凌晨 00:00 执行
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cleanup] 开始清理已完成的每日任务...');
    try {
      const result = await prisma.task.deleteMany({
        where: {
          isLongTerm: false,
          status: 'DONE',
        },
      });
      console.log(`[Cleanup] 清理完成，删除了 ${result.count} 个已完成任务`);
    } catch (err) {
      console.error('[Cleanup] 清理失败:', err);
    }
  });

  console.log('[Cleanup] 每日任务自动清理已启动，每天 00:00 执行');
}
