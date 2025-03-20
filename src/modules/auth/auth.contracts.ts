import { RequestResult } from 'src/common/types';
import { BuildRegistrationTokenDto, LoginDto } from './dto';

type AccessRefreshTokens = {
  accessToken: string;
  refreshToken: string;
};

export class LoginRequest extends LoginDto {}
export type LoginResponse = AccessRefreshTokens;

export class GetTokenForRegistrationRequest extends BuildRegistrationTokenDto {}
export type GetTokenForRegistrationResponse = string;

export type RegisterRequest = {
  code: string;
};
export type RegisterResponse = AccessRefreshTokens;

export type RefreshResponse = AccessRefreshTokens;

export type ResendVerificationCodeResponse = string;

export type ChangePasswordRequest = {
  newPassword: string;
};

export type GetResetPasswordTokenRequest = {
  email: string;
};
export type GetResetPasswordTokenResponse = string;

export type VerifyResetPasswordTokenRequest = {
  code: string;
};
export type VerifyResetPasswordTokenResponse = RequestResult;
