import { SetMetadata } from '@nestjs/common';

export enum RolesEnum {
  ADMIN = 'admin',
  USER = 'user',
  EXPERT= 'expert'
}

export const Roles = (...roles: RolesEnum[]) => SetMetadata('roles', roles);
