import { DatabaseConfiguration, MigrationSchema } from '../types';
import { join } from 'pathe';
import { Client } from '../client/Client';

export const getMigrationDocuments = async (client: Client) => {
  return client.getModel<MigrationSchema>('migrations').find({}).sort('file');
};

export const initMigrationSchema = (client: Client) => {
  client.getSchema('migrations').add({
    file: {
      type: String,
      required: true,
      unique: true,
    },
    executedOn: {
      type: Date,
      required: false,
    },
  });
};

export const getAbsoluteMigrationDir = (
  databaseConfig: DatabaseConfiguration,
  projectRootDir: string
) => {
  return join(projectRootDir, databaseConfig.migrationDir);
};