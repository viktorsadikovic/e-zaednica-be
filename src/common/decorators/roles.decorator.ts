import { SetMetadata } from '@nestjs/common';
import { Role } from '../../modules/user/interface/role.interface';

export const ROLES_KEY = 'roles';
export const HasRole = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
