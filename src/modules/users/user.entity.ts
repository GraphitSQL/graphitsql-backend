import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
  Relation,
} from 'typeorm';
import { ProjectEntity } from '../projects/project/project.entity';
import { ProjectUserEntity } from '../projects/project-user/project-user.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  displayName: string;

  @Column({ nullable: false, default: 'red' })
  avatarColor: string | undefined;

  @Column({ nullable: true })
  about: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => ProjectEntity, project => project.createdBy)
  @JoinColumn({ name: 'created_by_id' })
  createdProjects: Relation<ProjectEntity[]>;

  @OneToMany(() => ProjectUserEntity, projectUser => projectUser.user)
  @JoinColumn({ name: 'user_id' })
  projects: Relation<ProjectUserEntity[]>;
}
