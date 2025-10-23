import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtUser } from '../common/types/auth';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrg(user: JwtUser) {
    const org = await this.prisma.organization.findUnique({ where: { id: user.orgId } });
    if (!org) return null;
    if (user.role === 'ADMIN') return org;
    const { joinCode, ...rest } = org as any;
    return rest;
  }

  updateOrg(user: JwtUser, body: { name?: string }) {
    return this.prisma.organization.update({
      where: { id: user.orgId },
      data: { name: body?.name },
    });
  }

  listUsers(user: JwtUser) {
    return this.prisma.user.findMany({
      where: { orgId: user.orgId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async setRole(user: JwtUser, userId: string, role: 'ADMIN' | 'USER') {
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }
}
