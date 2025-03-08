import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsEmail()
  public email: string;

  @IsOptional()
  @MaxLength(300)
  public about: string;

  @IsOptional()
  @MaxLength(250)
  @IsString()
  public displayName: string;

  @IsOptional()
  @IsString()
  public avatarColor: string;
}
