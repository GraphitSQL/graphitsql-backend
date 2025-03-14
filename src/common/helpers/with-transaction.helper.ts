import { DataSource, QueryRunner } from 'typeorm';

export async function withTransaction<T>(
  datasource: DataSource,
  fn: (queryRunner: QueryRunner) => Promise<T>,
  activeQueryRunner?: QueryRunner,
) {
  if (activeQueryRunner) {
    return fn(activeQueryRunner);
  }

  const queryRunner = datasource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const result = await fn(queryRunner);

    await queryRunner.commitTransaction();

    return result;
  } catch (e) {
    await queryRunner.rollbackTransaction();
    throw e;
  } finally {
    await queryRunner.release();
  }
}
