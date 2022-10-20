import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { REQUIRE_ACTIVE_PROFILE } from '../decorators/active-profile.decorator';

@Injectable()
export class HasActiveProfileGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: Logger,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requireActiveProfile = this.reflector.getAllAndOverride(
      REQUIRE_ACTIVE_PROFILE,
      [context.getHandler(), context.getClass()],
    );
    const { user } = context.switchToHttp().getRequest();

    if (!requireActiveProfile) {
      return true;
    }

    if (user?.activeProfile) {
      return true;
    } else {
      this.logger.error(`{message: 'Forbidden', requestUserId: '${user?.id}'}`);
      throw new ForbiddenException(
        'Choose profile in order to be able to proceed with this action',
      );
    }
  }
}
