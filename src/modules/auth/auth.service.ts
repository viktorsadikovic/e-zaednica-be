import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/request/signUpDto.request.dto';
import { JwtPayload } from './strategy/jwt/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';
import { UserDocument } from '../user/schema/user.schema';
import { Role } from '../user/interface/role.interface';
import { SignInDto } from './dto/request/signInDto.dto';
import { RequestPasswordResetDto } from './dto/request/requestPasswordResetDto.dto';
import { ValidatePasswordResetTokenDto } from './dto/request/validatePasswordResetTokenDto.dto';
import { PasswordResetDto } from './dto/request/passwordResetDto.dto';
import { Token } from '../user/interface/token.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async hashPassword(plainPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();

    return await bcrypt.hash(plainPassword, salt);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ email }, {});
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signUp(signUpDto: SignUpDto) {
    let user: UserDocument = await this.userRepository.findOne(
      { email: signUpDto.email },
      {},
    );
    if (user) {
      throw new BadRequestException(
        `User with email ${signUpDto.email} already exists`,
      );
    }
    user = await this.userRepository.create(
      await this.createUserDocument(signUpDto),
    );
    const accessToken = this.createAccessToken(user);

    return {
      user,
      accessToken,
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    let user: UserDocument = await this.userRepository.findOneAndPopulate(
      { email },
      {},
      [{ path: 'profiles', populate: 'houseCouncil' }],
    );
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException(`Invalid login credentials`);
    }
    const accessToken = this.createAccessToken(user);

    return {
      user,
      accessToken,
    };
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;
    const user = await this.userRepository.findOne({ email }, {});

    if (user) {
      const tokens = (
        await this.userRepository.requestedTokensInPast(email)
      )[0];

      if (tokens && user.tokens && tokens.tokens.length === 5) {
        this.logger.error(
          `{
            message: 'Too many requests in the past 10 minutes', 
            method: 'requestPasswordReset', 
            requestUserEmail: '${email}'
          }`,
        );
        throw new HttpException(
          `Too many requests in the past 10 minutes.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const token: Token = {
      token: Math.floor(100000 + Math.random() * 900000).toString(),
    };

    await this.userService.findOneAndUpdate(
      { email },
      {
        $push: {
          tokens: token,
        },
      },
    );

    // SEND EMAIL with token
    return { token: token, userId: user.id };
  }

  async validatePasswordResetToken(
    validatePasswordResetDto: ValidatePasswordResetTokenDto,
  ) {
    const { token, userId } = validatePasswordResetDto;
    await this.userService.findOneAndUpdate({ _id: userId }, {});
    const tokens = (
      await this.userRepository.validationToken(userId, token)
    )[0];

    if (tokens && tokens.tokens && tokens.tokens.length) {
      const tokenValidUntil = tokens.tokens[0].validUntil;
      if (tokenValidUntil < new Date()) {
        this.logger.error(
          `{
            message: 'Token is invalid or expired',
            method: 'validatePasswordResetToken',
            requestUserId: '${userId}'
          }`,
        );
        throw new UnauthorizedException('Token is invalid or expired');
      }
      return { token, userId };
    }
    throw new BadRequestException('Token is invalid');
  }

  async resetPassword(passwordResetDto: PasswordResetDto) {
    const { userId, token, password } = passwordResetDto;

    const isValidToken = await this.validatePasswordResetToken({
      userId,
      token,
    });

    if (!isValidToken) {
      this.logger.error(
        `{
          message: 'Token is invalid or expired',
          method: 'passwordReset',
          requestUserId: '${userId}'
        }`,
      );
      throw new UnauthorizedException('Token is invalid or expired');
    }

    const user = await this.userService.findOneAndUpdate(
      { _id: userId },
      {
        password: await this.hashPassword(password),
        tokens: [],
      },
    );
    // SEND EMAIL
    return true;
  }

  private createAccessToken(user: UserDocument) {
    const payload: JwtPayload = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      _id: user.id,
    };
    const accessToken: string = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get('APP_ENV') === 'local' ? 360 * 60 : 15 * 60,
      secret: this.configService.get('JWT_SECRET_KEY'),
    });
    return accessToken;
  }

  private async createUserDocument(signUpDto: SignUpDto) {
    signUpDto.password = await this.hashPassword(signUpDto.password);
    return {
      ...signUpDto,
      role: Role.USER,
    };
  }
}
