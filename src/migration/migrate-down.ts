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
export const migrateDownToEnd = async (
  migrator: Migrator,
  callbacks?: MigrationCallbacks
): Promise<void> => {
  // TODO:: implement me
};

/**
 * Executes all migrations between the last executed migration and
 * the given migration.
 */
export const migrateDownTo = async (
  migrationUntilToMigrate: string,
  migrator: Migrator,
  callbacks?: {
    beforeMigrate?: (migrationName: string) => void;
    onMigrationFinished?: (executionResult: MigrationExecutionResult) => void;
  }
) => {
  // TODO:: implement me
};

/**
 * Executes one migration
 */
export const migrateDownUp = async (
  migration: string,
  migrator: Migrator,
  callbacks?: MigrationCallbacks
): Promise<MigrationExecutionResult | null> => {
  // TODO:: implement me
  return null;
};
