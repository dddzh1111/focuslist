import prisma from '../lib/prisma';

const DEFAULT_USER_ID = 'default';

export async function getOrCreateUser() {
  let user = await prisma.user.findFirst({ where: { id: DEFAULT_USER_ID } });
  if (!user) {
    user = await prisma.user.create({
      data: { id: DEFAULT_USER_ID, name: 'FocusList User' },
    });
  }
  return user;
}

export const listService = {
  async getAll(userId: string) {
    return prisma.list.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { tasks: true } } },
    });
  },

  async create(userId: string, data: { name: string; color?: string; icon?: string }) {
    return prisma.list.create({
      data: { ...data, userId },
    });
  },

  async update(id: string, userId: string, data: { name?: string; color?: string; icon?: string; sortOrder?: number }) {
    return prisma.list.update({
      where: { id, userId },
      data,
    });
  },

  async delete(id: string, userId: string) {
    // 先删除该清单下的所有任务（包括番茄记录会通过外级联删除）
    await prisma.task.deleteMany({
      where: { listId: id, userId },
    });
    // 再删除清单（关联的 section 也会被级联删除）
    return prisma.list.delete({ where: { id, userId } });
  },

  async reorder(userId: string, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.list.update({ where: { id, userId }, data: { sortOrder: index } })
    );
    await prisma.$transaction(updates);
  },
};

