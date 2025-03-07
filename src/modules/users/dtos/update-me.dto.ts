import { IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsEmail()
  public email: string;

  @IsOptional()
  @MaxLength(300)
  public about?: string;

  @IsOptional()
  @MaxLength(250)
  public displayName?: string;

  @IsOptional()
  public avatarColor?: string;
}
