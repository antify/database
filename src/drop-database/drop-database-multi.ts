import {
  DropDatabaseResult,
  MultiConnectionDatabaseConfiguration,
} from '../types';
import { MultiConnectionClient } from '../client/MultiConnectionClient';
import { dropDatabase } from './drop-database';

export type MultiConnectionDropDatabaseCallbacks = {
  beforeDropDatabase?: (tenantId: string, tenantName: string) => void;
  onDropDatabaseFinished?: (result: DropDatabaseResult) => void;
  onNoDatabasesToDrop?: () => void;
};

/**
 * Drop all databases of a multi connection client
 */
export const dropDatabaseMulti = async (
  databaseConfiguration: MultiConnectionDatabaseConfiguration,
  callbacks?: MultiConnectionDropDatabaseCallbacks
): Promise<void> => {
  const tenants = await databaseConfiguration.fetchTenants();

  if (tenants.length <= 0) {
    return callbacks?.onNoDatabasesToDrop?.();
  }

  for (const tenant of tenants) {
    const client = await MultiConnectionClient.getInstance(
      databaseConfiguration
    ).connect(tenant.id);

    callbacks?.beforeDropDatabase?.(tenant.id, tenant.name);

    const result = await dropDatabase(client);

    callbacks?.onDropDatabaseFinished?.({
      tenantId: tenant.id,
      tenantName: tenant.name,
      result,
    });

    if (result?.error) {
      return;
    }
  }
};