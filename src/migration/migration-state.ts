import { Client } from '../client/Client';
import { DatabaseConfiguration, Migration } from '../types';
import { loadMigrationsFromFilesystem } from './file-handler';
import { getMigrationDocuments, initMigrationSchema } from './utils';

export class MigrationState {
  /**
   * All available migrations in filesystem
   */
  readonly migrations: Migration[];

  /**
   * All available migrations in filesystem
   */
  readonly available: string[];

  /**
   * All executed migrations in database
   */
  readonly executed: string[];

  /**
   * Not executed migrations
   */
  readonly notExecuted: string[];

  /**
   * Executed migrations but missing in filesystem
   */
  readonly missing: string[];

  /**
   * Latest not executed migration
   */
  readonly latestVersion: string | null;

  /**
   * Next not executed migration
   */
  readonly nextVersion: string | null;

  /**
   * Current executed migration
   */
  readonly currentVersion: string | null;

  /**
   * Previous executed migration
   */
  readonly prevVersion: string | null;

  constructor(available: Migration[], executed: string[]) {
    this.migrations = available;
    this.available = available.map((migration) => {
      if (migration.name === undefined) {
        throw new Error(`Missing required migration name`);
      }

      return migration.name;
    });
    this.executed = executed;
    this.notExecuted = this.findItemsNotIn(this.available, executed);
    this.missing = this.findItemsNotIn(executed, this.available);
    this.prevVersion = executed[executed.length - 2] || null;
    this.currentVersion = executed[executed.length - 1] || null;
    this.latestVersion = this.available[this.available.length - 1] || null;
    this.nextVersion = this.currentVersion
      ? this.getMigrationsAfter(this.notExecuted, this.currentVersion)[0]
      : this.notExecuted[0];
  }

  private findItemsNotIn = (
    firtList: string[],
    secondList: string[]
  ): string[] => {
    return firtList
      .map((first) =>
        !secondList.some((second) => second === first) ? first : null
      )
      .filter((item) => !!item) as string[];
  };

  /**
   * Return all not executed migrations which are older than the current migration version
   */
  getAllNotExecutedAfterCurrent = (): string[] =>
    this.currentVersion
      ? this.getAllNotExecutedAfter(this.currentVersion)
      : this.notExecuted;

  /**
   * Return all not executed migrations which are older than the given migration version
   */
  getAllNotExecutedAfter = (
    migration: string,
    beginWithGivenMigration: boolean = false
  ): string[] =>
    this.getMigrationsAfter(
      this.notExecuted,
      migration,
      beginWithGivenMigration
    );

  getMigrationsAfter = (
    migrations: string[],
    migration: string,
    beginWithGivenMigration: boolean = false
  ): string[] => {
    const migrationsWithGivenMigration = [
      migration,
      ...new Set(migrations),
    ].sort();
    const migrationIndex = migrationsWithGivenMigration.findIndex(
      (_migration) => _migration === migration
    );

    return migrationsWithGivenMigration.filter((_migration, index) => {
      if (beginWithGivenMigration) {
        return index > migrationIndex;
      } else {
        return index > migrationIndex && _migration !== migration;
      }
    });
  };

  getMigrationFromName(migrationName: string): Migration {
    const migration = this.migrations.find(
      (_migration) => _migration.name === migrationName
    );

    if (!migration) {
      throw new Error(`Migration with name ${migrationName} does not exists`);
    }

    return migration;
  }
}

export const makeMigrationState = async (
  client: Client,
  projectRootDir: string,
  databaseConfiguration: DatabaseConfiguration
): Promise<MigrationState> => {
  initMigrationSchema(client);

  return new MigrationState(
    loadMigrationsFromFilesystem(projectRootDir, databaseConfiguration),
    (await getMigrationDocuments(client)).map((item) => item.file)
  );
};
