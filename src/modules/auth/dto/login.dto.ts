import { IsDefined, IsEmail } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @IsEmail()
  public email: string;

  @IsDefined()
  public password: string;
}
