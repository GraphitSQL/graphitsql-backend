import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { ProjectEdgeEntity } from 'src/modules/edges/edge.entity';
import { ProjectNodeEntity } from 'src/modules/nodes/node.entity';

export class UpdateProjectDataDto {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Array<ProjectNodeEntity>)
  public nodes: Array<Partial<ProjectNodeEntity>>;

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Array<ProjectEdgeEntity>)
  public edges: Array<Partial<ProjectEdgeEntity>>;
}
