import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Максимальная длина проекта - 100 символов' })
  public title?: string;
}
