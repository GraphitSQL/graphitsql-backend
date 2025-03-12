import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  UnauthorizedException,
  Res,
  Logger,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';

import {
  ChangePasswordRequest,
  GetTokenForRegistrationRequest,
  GetTokenForRegistrationResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationCodeResponse,
} from './auth.contracts';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser, RequestResult } from 'src/common/types';
import { ErrorsInterceptor } from 'src/common/interceptors';

@Controller('auth')
@UseInterceptors(ErrorsInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly logger: Logger,
  ) {
    this.logger = new Logger(AuthController.name);
  }

  @Post('get-token-for-registration')
  async getTokenForRegistration(
    @Body() data: GetTokenForRegistrationRequest,
  ): Promise<GetTokenForRegistrationResponse> {
    return this.authService.buildRegistrationToken(data);
  }

  @Post('register')
  async register(@Req() req: Request, @Body() { code }: RegisterRequest): Promise<RegisterResponse> {
    const registrationToken = req.get('registration-token');

    if (!registrationToken) {
      throw new UnauthorizedException('Доступ запрещен');
    }

    return this.authService.register(registrationToken, code);
  }

  @Get('resend-verification-code')
  async resendVerificationCode(@Req() req: Request): Promise<ResendVerificationCodeResponse> {
    const registrationToken = req.get('registration-token');

    if (!registrationToken) {
      throw new UnauthorizedException('Доступ запрещен');
    }

    return this.authService.resendVerificationCode(registrationToken);
  }

  @Post('login')
  async login(@Body() payload: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(payload);
  }

  @UseGuards(AccessTokenGuard)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(
    @Body() payload: ChangePasswordRequest,
    @CurrentUser() user: ContextUser,
  ): Promise<RequestResult> {
    await this.authService.changePassword(payload.newPassword, user.sub);

    return 'OK';
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.logout(req.user['sub']);

    if (!result) {
      res.send().status(400);
      return;
    }

    res.send().status(200);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request): Promise<RefreshResponse> {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];

    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get('check-authorization')
  async validateAccessToken(@CurrentUser() user: ContextUser): Promise<RequestResult> {
    return user.sub ? 'OK' : 'ERROR';
  }
}
