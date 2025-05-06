import {
  makeMigrationState, MigrationState,
} from './migration-state';
import {
  SingleConnectionClient,
} from '../client/SingleConnectionClient';
import {
  MultiConnectionClient,
} from '../client/MultiConnectionClient';

// TODO:: Rename. Its a data holder and not the business logic which migrates something
export class Migrator {
  constructor(
    readonly client: SingleConnectionClient | MultiConnectionClient,
    readonly projectRootDir: string = process.cwd(),
  ) {
  }

  loadMigrationState = async (): Promise<MigrationState> => await makeMigrationState(this.client, this.projectRootDir);
}
