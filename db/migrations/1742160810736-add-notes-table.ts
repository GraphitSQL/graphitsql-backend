import { id, timestampts } from 'db/utils';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddNotesTable1742160810736 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notes',
        columns: [
          id,
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'project_id',
            type: 'uuid',
          },
          {
            name: 'note_text',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'is_resolved',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          ...timestampts,
        ],
        indices: [
          {
            name: 'IDX_notes_created_by',
            columnNames: ['user_id'],
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKeys('notes', [
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
        name: 'FK_notes_project_id',
      }),
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_notes_user_id',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('notes', 'FK_notes_project_id');
    await queryRunner.dropForeignKey('notes', 'FK_notes_user_id');
    await queryRunner.dropTable('notes');
  }
}
