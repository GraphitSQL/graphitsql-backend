import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';
import { UserEntity } from 'src/modules/users/user.entity';

@Entity('projects_users')
@Unique('UQ_projects_users', ['userId', 'projectId'])
export class ProjectUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'boolean', default: true })
  canEdit: boolean;

  @Column({ type: 'boolean', default: true })
  canLeaveNotes: boolean;

  @ManyToOne(() => ProjectEntity, project => project.projectUsers, { onDelete: 'CASCADE' })
  project: ProjectEntity;

  @ManyToOne(() => UserEntity, user => user.projects, { onDelete: 'CASCADE' })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
