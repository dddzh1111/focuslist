import prisma from '../lib/prisma';
import { DEFAULT_SETTINGS, UserSettings } from '../types';

export const settingsService = {
  /**
   * 获取用户设置，如果用户首次访问则自动创建默认设置并写入数据库
   */
  async get(userId: string): Promise<UserSettings> {
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return DEFAULT_SETTINGS;

    // 如果 settings 字段为空或解析失败，使用默认设置并自动写回数据库
    try {
      const parsed = JSON.parse(user.settings);
      // 浅合并默认值，确保新字段有默认值（向前兼容）
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      // 如果合并后与存储值不同，写回数据库
      if (JSON.stringify(merged) !== user.settings) {
        await prisma.user.update({
          where: { id: userId },
          data: { settings: JSON.stringify(merged) },
        });
      }
      return merged;
    } catch {
      // 解析失败时写回默认值
      await prisma.user.update({
        where: { id: userId },
        data: { settings: JSON.stringify(DEFAULT_SETTINGS) },
      });
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * 更新用户设置，支持部分更新（只更新传入的字段）
   */
  async update(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    // 先获取当前设置（含默认值合并）
    const current = await this.get(userId);
    // 部分合并
    const merged = { ...current, ...settings };
    await prisma.user.update({
      where: { id: userId },
      data: { settings: JSON.stringify(merged) },
    });
    return merged;
  },
};
