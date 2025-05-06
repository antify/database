import {
  MigrateTenantResult,
} from '../types';
import {
  Migrator,
} from './migrator';
import {
  MigrationCallbacks,
} from './migrate-down';
import {
  migrateOneUp, migrateUpTo, migrateUpToEnd,
} from './migrate-up';
import {
  MultiConnectionClient,
} from '../client/MultiConnectionClient';

export type MultiConnectionMigrationCallbacks = {
  beforeMigrateTenant?: (tenantId: string, tenantName: string) => void;
  onTenantMigrationsFinished?: (
    migrateTenantResult: MigrateTenantResult
  ) => void;
} & MigrationCallbacks;

/**
 * Migrates all tenants of the given databaseConfiguration to end.
 */
export const migrateTenantsUpToEnd = async (
  client: MultiConnectionClient,
  projectRootDir: string,
  callbacks?: MultiConnectionMigrationCallbacks,
): Promise<void> => {
  const tenants = await client.getConfiguration().fetchTenants();

  for (const tenant of tenants) {
    await client.connect(tenant.id);

    const migrator = new Migrator(client, projectRootDir);

    callbacks?.beforeMigrateTenant?.(tenant.id, tenant.name);

    const results = await migrateUpToEnd(migrator, callbacks);

    callbacks?.onTenantMigrationsFinished?.({
      tenantId: tenant.id,
      tenantName: tenant.name,
      results,
    });

    if (results[results.length - 1]?.stopMigrationProcess === true) {
      return;
    }
  }
};

/**
 * Migrates all tenants of the given databaseConfiguration to the given migration.
 */
export const migrateTenantsUpTo = async (
  migrationUntilToMigrate: string,
  client: MultiConnectionClient,
  projectRootDir: string,
  callbacks?: MultiConnectionMigrationCallbacks,
): Promise<void> => {
  const tenants = await client.getConfiguration().fetchTenants();

  for (const tenant of tenants) {
    await client.connect(tenant.id);

    const migrator = new Migrator(client, projectRootDir);

    callbacks?.beforeMigrateTenant?.(tenant.id, tenant.name);

    const results = await migrateUpTo(
      migrationUntilToMigrate,
      migrator,
      callbacks,
    );

    callbacks?.onTenantMigrationsFinished?.({
      tenantId: tenant.id,
      tenantName: tenant.name,
      results,
    });

    if (results[results.length - 1]?.stopMigrationProcess === true) {
      return;
    }
  }
};

/**
 * Executes the given migration in all tenants of the given databaseConfiguration.
 */
export const migrateTenantsOneUp = async (
  migration: string,
  client: MultiConnectionClient,
  projectRootDir: string,
  callbacks?: MultiConnectionMigrationCallbacks,
): Promise<void> => {
  const tenants = await client.getConfiguration().fetchTenants();

  for (const tenant of tenants) {
    await client.connect(tenant.id);

    const migrator = new Migrator(client, projectRootDir);

    callbacks?.beforeMigrateTenant?.(tenant.id, tenant.name);

    const result = await migrateOneUp(migration, migrator, callbacks);

    callbacks?.onTenantMigrationsFinished?.({
      tenantId: tenant.id,
      tenantName: tenant.name,
      results: [
        result,
      ],
    });

    if (result?.stopMigrationProcess === true) {
      return;
    }
  }
};
