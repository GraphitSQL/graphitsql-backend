import { IsBoolean, IsDefined, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsDefined()
  @IsString()
  public title: string;

  @IsDefined()
  @IsBoolean()
  public isPublic: boolean;
}
