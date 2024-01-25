import jiti from 'jiti';
import { MultiConnectionClient } from './client/MultiConnectionClient';
import { SingleConnectionClient } from './client/SingleConnectionClient';
import { DatabaseConfigurations } from './types';
import { Connection } from 'mongoose';
// TODO:: rename file in load-database-configuration.ts

function tryRequire(id: string, rootDir: string = process.cwd()) {
  const _require = jiti(rootDir, { interopDefault: true, esmResolve: true });

  try {
    return _require(id);
  } catch (error: any) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      throw error;

      // console.error(`Error trying import ${id} from ${rootDir}`, error);
    }

    return {};
  }
}

// TODO:: do not export this
export function forceRequire(id: string, rootDir: string = process.cwd()) {
  const _require = jiti(rootDir, { interopDefault: true, esmResolve: true });

  return _require(id);
}

export function loadDatabaseConfiguration(
  require: boolean = true,
  rootDir: string = process.cwd()
): DatabaseConfigurations {
  // TODO:: replace with unjs/c12
  const configurations: DatabaseConfigurations = require
    ? forceRequire('./database.config', rootDir)
    : tryRequire('./database.config', rootDir);

  Object.keys(configurations).forEach((databaseName) => {
    configurations[databaseName].name = databaseName;
  });

  return configurations;
}

export const removeFileTypeExtension = (filename: string): string => {
  return filename.substring(0, filename.lastIndexOf('.'));
};

export function getDatabaseClient(
  contextId: string,
  rootDir: string = process.cwd()
): SingleConnectionClient | MultiConnectionClient {
  const configuration = loadDatabaseConfiguration(true, rootDir)[contextId];

  if (!configuration) {
    throw new Error(`Configuration with name ${contextId} does not exists`);
  }

  return configuration.isSingleConnection
    ? SingleConnectionClient.getInstance(configuration)
    : MultiConnectionClient.getInstance(configuration);
}

export const doesDatabaseExist = async (connection: Connection, databaseName: string): Promise<boolean> => {
  const databases = await connection.db.admin().listDatabases();
  const databaseNames = databases.databases.map((dbInfo) => dbInfo.name);

  return databaseNames.includes(databaseName);
};