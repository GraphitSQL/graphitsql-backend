import { IsBoolean, IsDefined, IsString, MaxLength } from 'class-validator';


export class CreateProjectDto {
  @IsDefined()
  @IsString()
  @MaxLength(100, { message: 'Максимальная длина проекта - 100 символов' })
  public title: string;

  @IsDefined()
  @IsBoolean()
  public isPublic: boolean;
}
