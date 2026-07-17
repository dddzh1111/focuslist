import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';

export const sectionService = {
  async getByListId(listId: string, userId: string) {
    // 校验 list 存在且属于该 user
    const list = await prisma.list.findFirst({
      where: { id: listId, userId },
    });
    if (!list) throw new NotFoundError('清单');

    return prisma.section.findMany({
      where: { listId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { tasks: true } } },
    });
  },

  async create(listId: string, userId: string, data: { name: string; sortOrder?: number }) {
    // 校验 list 存在且属于该 user
    const list = await prisma.list.findFirst({
      where: { id: listId, userId },
    });
    if (!list) throw new NotFoundError('清单');

    return prisma.section.create({
      data: {
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
        listId,
      },
      include: { _count: { select: { tasks: true } } },
    });
  },

  async update(id: string, userId: string, data: { name?: string; sortOrder?: number }) {
    // 校验 section 存在（通过 list.userId 校验归属）
    const section = await prisma.section.findFirst({
      where: { id, list: { userId } },
    });
    if (!section) throw new NotFoundError('单元');

    return prisma.section.update({
      where: { id },
      data,
      include: { _count: { select: { tasks: true } } },
    });
  },

  async delete(id: string, userId: string) {
    // 校验 section 存在（通过 list.userId 校验归属）
    const section = await prisma.section.findFirst({
      where: { id, list: { userId } },
    });
    if (!section) throw new NotFoundError('单元');

    return prisma.section.delete({
      where: { id },
    });
  },
};
