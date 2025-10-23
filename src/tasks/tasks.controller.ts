import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OrgOwnershipGuard } from '../common/guards/org-ownership.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { AuthRequest } from '../common/types/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Req() req: AuthRequest) {
    return this.tasks.list(req.user);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateTaskDto) {
    return this.tasks.create(req.user, dto);
  }

  @UseGuards(OrgOwnershipGuard)
  @Get(':id')
  get(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.tasks.get(req.user, id);
  }

  @UseGuards(OrgOwnershipGuard)
  @Patch(':id')
  update(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(req.user, id, dto);
  }

  @UseGuards(OrgOwnershipGuard)
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.tasks.delete(req.user, id);
  }
}
