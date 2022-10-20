import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../../user/schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwt-payload.interface';
import { UserRepository } from '../../../user/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userRepository: UserRepository,
    private configService: ConfigService,
    private readonly logger: Logger,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { email } = payload;
    const user = await (
      await this.userRepository.findOne({ email }, {})
    ).populate('activeProfile');

    if (!user) {
      this.logger.error(
        `{
          message: "Unauthorized", 
          method: 'validate',
          requestUserEmail: '${email}'
        }`,
      );
      throw new UnauthorizedException();
    }

    return user;
  }
}
