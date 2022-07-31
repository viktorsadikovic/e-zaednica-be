import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AllowUnauthenticated } from '../../common/decorators/publicRoute.decorator';
import { Serialize } from '../../common/interceptors/transformInterceptor.interceptor';
import { AuthService } from './auth.service';
import { PasswordResetDto } from './dto/request/passwordResetDto.dto';
import { RequestPasswordResetDto } from './dto/request/requestPasswordResetDto.dto';
import { SignInDto } from './dto/request/signInDto.dto';
import { SignUpDto } from './dto/request/signUpDto.request.dto';
import { ValidatePasswordResetTokenDto } from './dto/request/validatePasswordResetTokenDto.dto';

@Controller('auth')
@ApiTags('auth')
@ApiBearerAuth('accessToken')
export class AuthController {
  constructor(private authService: AuthService) {}

  @AllowUnauthenticated()
  // @Serialize()
  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @AllowUnauthenticated()
  // @Serialize()
  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }

  @AllowUnauthenticated()
  @Post('/request-password-reset')
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return await this.authService.requestPasswordReset(requestPasswordResetDto);
  }

  @AllowUnauthenticated()
  @Get('/validate-password-reset')
  async validatePasswordReset(@Query() params: ValidatePasswordResetTokenDto) {
    return await this.authService.validatePasswordResetToken(params);
  }

  @AllowUnauthenticated()
  @Post('/password-reset')
  async passwordReset(
    @Query() params: ValidatePasswordResetTokenDto,
    @Body() passwordResetDto: PasswordResetDto,
  ) {
    return await this.authService.resetPassword(params, passwordResetDto);
  }
}
