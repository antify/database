import {
  SingleConnectionClient,
} from './client/SingleConnectionClient';
import {
  MultiConnectionClient,
} from './client/MultiConnectionClient';
import {
  DatabaseConfigurations,
} from './types';

export function getDatabaseClient(
  databaseId: string,
  config: DatabaseConfigurations,
): SingleConnectionClient | MultiConnectionClient {
  const configuration = config[databaseId];

  if (!configuration) {
    throw new Error(`Configuration with name ${databaseId} does not exists`);
  }

  return configuration.isSingleConnection
    ? SingleConnectionClient.getInstance(configuration)
    : MultiConnectionClient.getInstance(configuration);
}
