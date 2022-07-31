import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/request/signUpDto.request.dto';
import { JwtPayload } from './strategy/jwt/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';
import { User, UserDocument } from '../user/schema/user.schema';
import { Role } from '../user/interface/role.interface';
import { SignInDto } from './dto/request/signInDto.dto';
import { RequestPasswordResetDto } from './dto/request/requestPasswordResetDto.dto';
import { ValidatePasswordResetTokenDto } from './dto/request/validatePasswordResetTokenDto.dto';
import { PasswordResetDto } from './dto/request/passwordResetDto.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {}

  async hashPassword(plainPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();

    return await bcrypt.hash(plainPassword, salt);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);
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
    let user: UserDocument = await this.userRepository.findOne({ email }, {});
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
    const user = await this.userRepository.findOne(
      { email: requestPasswordResetDto.email },
      {},
    );

    if (!user) {
      throw new NotFoundException(
        `User with email ${requestPasswordResetDto.email} does not exist`,
      );
    }

    const token = this.createAccessToken(user);

    // SEND EMAIL

    return token;
  }

  async validatePasswordResetToken({ token: string }) {
    // check valid token
    return {
      status: true,
    };
  }

  async resetPassword({ token: string }, passwordResetDto: PasswordResetDto) {
    // check valid token
    // SEND EMAIL
    return await this.userRepository.findOneAndUpdate(
      { _id: passwordResetDto.userId },
      { password: await this.hashPassword(passwordResetDto.password) },
    );
  }

  private createAccessToken(user: JwtPayload) {
    const payload: JwtPayload = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
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
