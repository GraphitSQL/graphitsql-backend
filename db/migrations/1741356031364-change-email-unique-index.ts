import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeEmailUniqueIndex1741356031364 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3";
      `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX "UQ_users_email_deleted_at" ON "users" ("email")
        WHERE "deleted_at" IS NULL;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX IF EXISTS "UQ_users_email_deleted_at";
    `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "UQ_97672ac88f789774dd47f7c8be3" ON users.email;
    `);
  }
}
