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
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';

import {
  ChangePasswordRequest,
  GetResetPasswordTokenRequest,
  GetResetPasswordTokenResponse,
  GetTokenForRegistrationRequest,
  GetTokenForRegistrationResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationCodeResponse,
  VerifyResetPasswordTokenRequest,
  VerifyResetPasswordTokenResponse,
} from './auth.contracts';
import { CurrentUser } from 'src/common/decorators';
import { ContextUser, RequestResult } from 'src/common/types';

@Controller('auth')
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

  @Post('get-reset-password-token')
  async getResetPasswordToken(@Body() data: GetResetPasswordTokenRequest): Promise<GetResetPasswordTokenResponse> {
    return this.authService.buildResetPasswordToken(data.email);
  }

  @Get('resend-reset-password-verification-code')
  async resendResetPasswordCode(@Req() req: Request): Promise<ResendVerificationCodeResponse> {
    const resetPasswordToken = req.get('reset-password-token');

    if (!resetPasswordToken) {
      throw new UnauthorizedException('Доступ запрещен');
    }

    return this.authService.resendResetPasswordCode(resetPasswordToken);
  }

  @Post('verify-reset-password-code')
  async verifyResetPasswordCode(
    @Req() req: Request,
    @Body() data: VerifyResetPasswordTokenRequest,
  ): Promise<VerifyResetPasswordTokenResponse> {
    const resetPasswordToken = req.get('reset-password-token');

    console.log('resetPasswordToken');

    if (!resetPasswordToken) {
      throw new UnauthorizedException('Доступ запрещен');
    }

    await this.authService.validateResetPasswordToken(resetPasswordToken, data.code);

    return 'OK';
  }

  @Patch('set-new-password')
  async setNewPassword(@Req() req: Request, @Body() data: ChangePasswordRequest): Promise<RequestResult> {
    const resetPasswordToken = req.get('reset-password-token');

    if (!resetPasswordToken) {
      throw new UnauthorizedException('Доступ запрещен');
    }

    await this.authService.setNewPassword(data.newPassword, resetPasswordToken);

    return 'OK';
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
