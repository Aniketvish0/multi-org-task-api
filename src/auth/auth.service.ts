import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private signToken(user: { id: string; orgId: string; role: Role }) {
    const payload = { sub: user.id, orgId: user.orgId, role: user.role };
    return { access_token: this.jwt.sign(payload) };
  }

  async register(dto: RegisterDto) {
    const emailInUse = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (emailInUse) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    if (dto.mode === 'create') {
      if (!dto.orgName) throw new BadRequestException('orgName is required');
      const joinCode = Math.random().toString(36).slice(2, 10).toUpperCase();
      const org = await this.prisma.organization.create({
        data: { name: dto.orgName, joinCode },
      });
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: passwordHash,
          role: 'ADMIN',
          orgId: org.id,
        },
      });
      return this.signToken({ id: user.id, orgId: user.orgId, role: user.role });
    }

    if (!dto.joinCode) throw new BadRequestException('joinCode is required');
    const org = await this.prisma.organization.findUnique({ where: { joinCode: dto.joinCode } });
    if (!org) throw new BadRequestException('Invalid join code');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: passwordHash,
        role: 'USER',
        orgId: org.id,
      },
    });
    return this.signToken({ id: user.id, orgId: user.orgId, role: user.role });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.signToken({ id: user.id, orgId: user.orgId, role: user.role });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, orgId: true },
    });
    return user;
  }
}
