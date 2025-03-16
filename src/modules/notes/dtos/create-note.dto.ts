import { IsBoolean, IsDefined, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsDefined()
  @IsString()
  @MaxLength(600)
  public noteText: string;

  @IsDefined()
  @IsString()
  public projectId: string;

  @IsOptional()
  @IsBoolean()
  public isResolved: boolean;
}
