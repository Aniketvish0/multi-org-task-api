import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtUser } from '../common/types/auth';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: JwtUser) {
    if (user.role === 'ADMIN') {
      return this.prisma.task.findMany({ where: { orgId: user.orgId } });
    }
    return this.prisma.task.findMany({ where: { orgId: user.orgId, ownerId: user.sub } });
  }

  create(user: JwtUser, dto: CreateTaskDto) {
    const ownerId = user.role === 'ADMIN' && dto.ownerId ? dto.ownerId : user.sub;
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: (dto.status as any) ?? 'TODO',
        priority: (dto.priority as any) ?? 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        ownerId,
        orgId: user.orgId,
      },
    });
  }

  get(user: JwtUser, id: string) {
    return this.prisma.task.findFirst({ where: { id, orgId: user.orgId } });
  }

  update(user: JwtUser, id: string, dto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as any,
        priority: dto.priority as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  delete(user: JwtUser, id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}
