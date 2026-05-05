async takeLead(userId: string) {
  const lead = await this.prisma.lead.findFirst({
    where: { status: 'NEW' },
    orderBy: { createdAt: 'asc' },
  });

  if (!lead) return null;

  try {
    return await this.prisma.lead.update({
      where: {
        id: lead.id,
        status: 'NEW', // 👈 ключевая защита
      },
      data: {
        status: 'IN_PROGRESS',
        assignedTo: userId,
      },
    });
  } catch (e) {
    return null; // кто-то уже забрал
  }
}