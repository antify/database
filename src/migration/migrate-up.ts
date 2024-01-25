import { Migration, MigrationExecutionResult, MigrationSchema } from '../types';
import { Client } from '../client/Client';
import { Migrator } from './migrator';

export type MigrationCallbacks = {
  beforeMigrate?: (migrationName: string) => void;
  onMigrationFinished?: (executionResult: MigrationExecutionResult) => void;
};

/**
 * Migrates all not executed migrations beginning from
 * last executed migration.
 */
export const migrateUpToEnd = async (
  migrator: Migrator,
  callbacks?: MigrationCallbacks
): Promise<MigrationExecutionResult[]> => {
  const results: MigrationExecutionResult[] = [];
  const migrationsToExecute = (
    await migrator.loadMigrationState()
  ).getAllNotExecutedAfterCurrent();

  if (migrationsToExecute.length <= 0) {
    callbacks?.onMigrationFinished?.({
      info: 'No migrations to migrate',
    });

    return results;
  }

  for (const migration of migrationsToExecute) {
    const result = await migrateOneUp(migration, migrator, callbacks);

    results.push(result);

    if (result.stopMigrationProcess) {
      return results;
    }
  }

  return results;
};

/**
 * Executes all migrations between the last executed migration and
 * the given migration.
 */
export const migrateUpTo = async (
  migrationUntilToMigrate: string,
  migrator: Migrator,
  callbacks?: {
    beforeMigrate?: (migrationName: string) => void;
    onMigrationFinished?: (executionResult: MigrationExecutionResult) => void;
  }
): Promise<MigrationExecutionResult[]> => {
  const results: MigrationExecutionResult[] = [];
  const migrationState = await migrator.loadMigrationState();

  if (
    !migrationState.available.some(
      (_migration) => _migration === migrationUntilToMigrate
    )
  ) {
    callbacks?.onMigrationFinished?.({
      error: new Error(
        `Migration with ${migrationUntilToMigrate} does not exists`
      ),
    });

    return results;
  }

  if (
    !migrationState.notExecuted.some(
      (_migration) => _migration === migrationUntilToMigrate
    )
  ) {
    callbacks?.onMigrationFinished?.({
      error: new Error(`Migration ${migrationUntilToMigrate} already executed`),
    });

    return results;
  }

  const migrationsToExecute = migrationState.getAllNotExecutedAfterCurrent();

  for (const _migration of migrationsToExecute) {
    const result = await migrateOneUp(_migration, migrator, callbacks);

    results.push(result);

    if (result.stopMigrationProcess || _migration === migrationUntilToMigrate) {
      return results;
    }
  }

  return results;
};

/**
 * Executes one migration
 */
export const migrateOneUp = async (
  migration: string,
  migrator: Migrator,
  callbacks?: MigrationCallbacks
): Promise<MigrationExecutionResult> => {
  const migrationState = await migrator.loadMigrationState();

  if (
    !migrationState.available.some((_migration) => _migration === migration)
  ) {
    const result = {
      error: new Error(`Migration ${migration} does not exists`),
    };

    callbacks?.onMigrationFinished?.(result);

    return result;
  }

  if (migrationState.executed.some((_migration) => _migration === migration)) {
    const result = {
      error: new Error(`Migration ${migration} already executed`),
    };

    callbacks?.onMigrationFinished?.(result);

    return result;
  }

  if (migrationState.getAllNotExecutedAfterCurrent()[0] !== migration) {
    const result = {
      error: new Error(
        `Can not execute migration ${migration} because there are not executed migrations before`
      ),
    };

    callbacks?.onMigrationFinished?.(result);

    return result;
  }

  callbacks?.beforeMigrate?.(migration);

  const result = await executeMigrationUp(
    migrator.client,
    migrationState.getMigrationFromName(migration)
  );

  callbacks?.onMigrationFinished?.(result);

  return result;
};

const executeMigrationUp = async (
  client: Client,
  migration: Migration
): Promise<MigrationExecutionResult> => {
  const result: MigrationExecutionResult = {
    migrationName: migration.name,
    error: null,
    executionTimeInMs: null,
  };
  const startTime = process.hrtime();

  try {
    await migration.up(client);
  } catch (e) {
    result.stopMigrationProcess = true;
    result.error = e as Error;
  }

  await client.getModel<MigrationSchema>('migrations').create({
    file: migration.name,
    executedOn: new Date(),
  });

  result.executionTimeInMs = process.hrtime(startTime)[1] / 1000000;

  return result;
};
