import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OrgService } from './org.service';
import { AuthRequest } from '../common/types/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('org')
export class OrgController {
  constructor(private readonly org: OrgService) {}

  @Get()
  getOrg(@Req() req: AuthRequest) {
    return this.org.getOrg(req.user);
  }

  @Roles('ADMIN')
  @Patch()
  update(@Req() req: AuthRequest, @Body() body: { name?: string }) {
    return this.org.updateOrg(req.user, body);
  }

  @Roles('ADMIN')
  @Get('users')
  listUsers(@Req() req: AuthRequest) {
    return this.org.listUsers(req.user);
  }

  @Roles('ADMIN')
  @Patch('users/:userId/role')
  setRole(
    @Req() req: AuthRequest,
    @Param('userId') userId: string,
    @Body() body: { role: 'ADMIN' | 'USER' },
  ) {
    return this.org.setRole(req.user, userId, body.role);
  }
}
