import { Client } from '../client/Client';
import { DatabaseConfiguration } from '../types';
import { makeMigrationState, MigrationState } from './migration-state';

// TODO:: Rename. Its a data holder and not the business logic which migrates something
export class Migrator {
  constructor(
    readonly client: Client,
    readonly databaseConfiguration: DatabaseConfiguration,
    readonly projectRootDir: string = process.cwd()
  ) {}

  loadMigrationState = async (): Promise<MigrationState> =>
    await makeMigrationState(
      this.client,
      this.projectRootDir,
      this.databaseConfiguration
    );
}
