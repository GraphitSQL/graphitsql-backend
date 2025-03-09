import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Relation,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../users/user.entity';
import { ProjectUserEntity } from '../project-user/project-user.entity';

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, default: false })
  isPublic: boolean;

  @Column({ type: 'uuid' })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => UserEntity, createdBy => createdBy.createdProjects, { onDelete: 'SET NULL' })
  @JoinColumn()
  createdBy: UserEntity;

  @OneToMany(() => ProjectUserEntity, projectUser => projectUser.project)
  projectUsers: Relation<ProjectUserEntity[]>;
}
