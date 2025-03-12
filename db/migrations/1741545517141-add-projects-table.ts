import { id, timestampts } from 'db/utils';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddProjectsTable1741545517141 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          id,
          {
            name: 'title',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'is_public',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          ...timestampts,
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        name: 'FK_users_projects_created_by',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'projects_users',
        columns: [
          id,
          {
            name: 'project_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'can_edit',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'can_leave_notes',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          ...timestampts,
        ],
        uniques: [
          {
            name: 'UQ_projects_users',
            columnNames: ['project_id', 'user_id'],
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKeys('projects_users', [
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
        name: 'FK_projects_users_project_id',
      }),
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_projects_users_user_id',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('projects_users', 'FK_projects_users_project_id');
    await queryRunner.dropForeignKey('projects_users', 'FK_projects_users_user_id');
    await queryRunner.dropForeignKey('projects', 'FK_users_projects_created_by');
    await queryRunner.dropTable('projects_users');
    await queryRunner.dropTable('projects');
  }
}
