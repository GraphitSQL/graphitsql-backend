import { BuildRegistrationTokenDto, LoginDto } from './dto';

type AccessRefreshTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginRequest = LoginDto;
export type LoginResponse = AccessRefreshTokens;

export type GetTokenForRegistrationRequest = BuildRegistrationTokenDto;
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
