import type { Request } from 'express';
import type { Role } from '@prisma/client';

export interface JwtUser {
  sub: string;
  orgId: string;
  role: Role;
}

export type AuthRequest = Request & { user: JwtUser };
