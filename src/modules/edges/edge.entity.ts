import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { ProjectEntity } from '../projects/project/project.entity';
import { ProjectNodeEntity } from '../nodes/node.entity';

@Entity({ name: 'projects_edges' })
export class ProjectEdgeEntity {
  @PrimaryColumn({ generated: false })
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column('uuid')
  source: string;

  @Column('uuid')
  target: string;

  @Column('text')
  sourceHandle: string;

  @Column('text')
  targetHandle: string;

  @Column({ type: 'text', default: 'smoothstep' })
  type: string;

  @Column({ type: 'text', default: 'hasMany' })
  markerEnd: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => ProjectEntity, project => project.edges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @ManyToOne(() => ProjectNodeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source' })
  sourceNode: ProjectNodeEntity;

  @ManyToOne(() => ProjectNodeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target' })
  targetNode: ProjectNodeEntity;
}
