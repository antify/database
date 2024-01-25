import {
  LoadFixtureResult,
  MultiConnectionDatabaseConfiguration,
} from '../types';
import { MultiConnectionClient } from '../client/MultiConnectionClient';
import { LoadFixtureCallbacks, loadFixtures } from './load-fixtures';

export type MultiConnectionLoadFixtureCallbacks = {
  beforeLoadFixtureTenant?: (tenantId: string, tenantName: string) => void;
  onTenantLoadFixturesFinished?: (loadFixtureResult: LoadFixtureResult) => void;
} & LoadFixtureCallbacks;

export const loadFixturesMulticonnection = async (
  databaseConfig: MultiConnectionDatabaseConfiguration,
  projectRootDir: string,
  callbacks?: MultiConnectionLoadFixtureCallbacks
): Promise<void> => {
  const tenants = await databaseConfig.fetchTenants();

  for (const tenant of tenants) {
    const client = await MultiConnectionClient.getInstance(
      databaseConfig
    ).connect(tenant.id);

    callbacks?.beforeLoadFixtureTenant?.(tenant.id, tenant.name);

    const results = await loadFixtures(
      databaseConfig,
      projectRootDir,
      client,
      callbacks
    );

    callbacks?.onTenantLoadFixturesFinished?.({
      tenantId: tenant.id,
      tenantName: tenant.name,
      results,
    });

    if (results[results.length - 1]?.stopLoadFixtureProcess === true) {
      return;
    }
  }
};
