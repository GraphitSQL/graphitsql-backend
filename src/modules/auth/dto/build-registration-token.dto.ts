import { IsDefined, IsEmail, IsOptional } from 'class-validator';

export class BuildRegistrationTokenDto {
  @IsDefined()
  @IsEmail()
  public email: string;

  @IsDefined()
  public password: string;

  @IsDefined()
  public userName: string;

  @IsOptional()
  public avatarColor?: string;
}
