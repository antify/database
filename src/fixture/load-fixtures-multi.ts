import {
  LoadFixtureResult,
} from '../types';
import {
  MultiConnectionClient,
} from '../client/MultiConnectionClient';
import {
  LoadFixtureCallbacks, loadFixtures,
} from './load-fixtures';

export type MultiConnectionLoadFixtureCallbacks = {
  beforeLoadFixtureTenant?: (tenantId: string, tenantName: string) => void;
  onTenantLoadFixturesFinished?: (loadFixtureResult: LoadFixtureResult) => void;
} & LoadFixtureCallbacks;

export const loadFixturesMulticonnection = async (
  client: MultiConnectionClient,
  projectRootDir: string,
  callbacks?: MultiConnectionLoadFixtureCallbacks,
): Promise<void> => {
  const tenants = await client.getConfiguration().fetchTenants();

  for (const tenant of tenants) {
    await client.connect(tenant.id);

    callbacks?.beforeLoadFixtureTenant?.(tenant.id, tenant.name);

    const results = await loadFixtures(
      client,
      projectRootDir,
      callbacks,
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
