import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtUser } from '../types/auth';

@Injectable()
export class OrgOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user: JwtUser; params: { id?: string } }>();
    const user = req.user;
    const taskId = req.params?.id as string | undefined;
    if (!taskId) return false;
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.orgId !== user.orgId) return false;
    if (user.role === 'ADMIN') return true;
    return task.ownerId === user.sub;
  }
}
