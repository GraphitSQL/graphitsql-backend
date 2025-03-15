import { id, timestampts } from 'db/utils';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddNodesAndEdgesTables1742050942505 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // node entities
    await queryRunner.createTable(
      new Table({
        name: 'projects_nodes',
        columns: [
          id,
          {
            name: 'project_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'position',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'text',
            default: "'table'",
            isNullable: false,
          },
          {
            name: 'data',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'measured',
            type: 'jsonb',
            isNullable: false,
          },
          ...timestampts,
        ],
        indices: [
          {
            columnNames: ['project_id'],
            name: 'IDX_projects_nodes_project_id',
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKeys('projects_nodes', [
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
        name: 'FK_projects_nodes_project_id',
      }),
    ]);

    // edge entities
    await queryRunner.createTable(
      new Table({
        name: 'projects_edges',
        columns: [
          {
            name: 'id',
            type: 'citext',
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: 'project_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'source',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'target',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'source_handle',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'target_handle',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'text',
            default: "'smoothstep'",
            isNullable: false,
          },
          {
            name: 'marker_end',
            type: 'text',
            default: "'hasMany'",
            isNullable: false,
          },
          ...timestampts,
        ],
        indices: [
          {
            columnNames: ['project_id'],
            name: 'IDX_projects_edges_project_id',
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKeys('projects_edges', [
      new TableForeignKey({
        columnNames: ['source'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects_nodes',
        onDelete: 'CASCADE',
        name: 'FK_projects_edges_project_nodes_source',
      }),
      new TableForeignKey({
        columnNames: ['target'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects_nodes',
        onDelete: 'CASCADE',
        name: 'FK_projects_edges_project_nodes_target',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('projects_nodes', 'FK_projects_nodes_project_id');
    await queryRunner.dropForeignKey('projects_edges', 'FK_projects_edges_project_nodes_source');
    await queryRunner.dropForeignKey('projects_edges', 'FK_projects_edges_project_nodes_target');

    await queryRunner.dropTable('projects_edges');
    await queryRunner.dropTable('projects_nodes');
  }
}
