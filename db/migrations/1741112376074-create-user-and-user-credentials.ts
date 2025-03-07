import { id, timestampts } from 'db/utils';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUserAndUserCredentials1741112376074 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          id,
          {
            name: 'email',
            type: 'text',
            isUnique: true,
          },
          {
            name: 'display_name',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'avatar_color',
            type: 'text',
            isNullable: false,
            default: "'red'",
          },
          {
            name: 'about',
            type: 'text',
            isNullable: true,
          },
          ...timestampts,
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_credentials',
        columns: [
          id,
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'refresh_token',
            type: 'text',
            isNullable: true,
          },
          ...timestampts,
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'user_credentials',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_users_user_crendentials',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_credentials', 'FK_users_user_crendentials');
    await queryRunner.dropTable('user_credentials');
    await queryRunner.dropTable('users');
  }
}
