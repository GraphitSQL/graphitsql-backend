import { IsDefined, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class BuildRegistrationTokenDto {
  @IsDefined()
  @IsEmail()
  public email: string;

  @IsDefined()
  public password: string;

  @IsDefined()
  @MaxLength(250)
  public userName: string;

  @IsOptional()
  public avatarColor?: string;
}
