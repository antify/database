import { describe, test, expect, vi, afterEach } from 'vitest';
import { MultiConnectionDatabaseConfiguration } from '../../types';
import { MultiConnectionClient } from '../../client/MultiConnectionClient';
import {
  migrateTenantsOneUp,
  migrateTenantsUpTo,
  migrateTenantsUpToEnd,
  MultiConnectionMigrationCallbacks,
} from '../migrate-up-multi';
import * as migrateUpFunctions from '../migrate-up';

// TODO:: remove duplicated code
describe('Migrate up multi connection test', async () => {
  const getMocks = () => {
    const databaseConfiguration: MultiConnectionDatabaseConfiguration = {
      databaseUrl: 'mongodb://root:root@localhost:27017',
      isSingleConnection: false,
      migrationDir: '',
      fetchTenants: () => {
        return new Promise((resolve) =>
          resolve([
            {
              id: '1',
              name: 'First Tenant',
            },
            {
              id: '2',
              name: 'Second Tenant',
            },
            {
              id: '3',
              name: 'Third Tenant',
            },
          ])
        );
      },
    };

    return { databaseConfiguration };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should migrate all tenants up to end', async () => {
    const { databaseConfiguration } = getMocks();
    const callback: MultiConnectionMigrationCallbacks = {
      beforeMigrateTenant() {},
      onTenantMigrationsFinished() {},
    };
    const onTenantMigrationsFinishedSpy = vi.spyOn(
      callback,
      'onTenantMigrationsFinished'
    );
    const beforeMigrateTenantSpy = vi.spyOn(callback, 'beforeMigrateTenant');

    vi.spyOn(MultiConnectionClient, 'getInstance').mockReturnValueOnce({
      connect() {},
    } as unknown as MultiConnectionClient);

    vi.spyOn(migrateUpFunctions, 'migrateUpToEnd').mockReturnValue(
      new Promise(async (resolve) => {
        resolve([
          {
            executionTimeInMs: 100,
            migrationName: 'xyz',
          },
        ]);
      })
    );

    await migrateTenantsUpToEnd(databaseConfiguration, '', callback);

    expect(beforeMigrateTenantSpy.mock.calls).toEqual([
      ['1', 'First Tenant'],
      ['2', 'Second Tenant'],
      ['3', 'Third Tenant'],
    ]);

    expect(onTenantMigrationsFinishedSpy.mock.calls).toEqual([
      [
        {
          tenantId: '1',
          tenantName: 'First Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
      [
        {
          tenantId: '2',
          tenantName: 'Second Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
      [
        {
          tenantId: '3',
          tenantName: 'Third Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
    ]);
  });

  test('Should migrate all tenants up to a specific migration', async () => {
    const { databaseConfiguration } = getMocks();
    const callback: MultiConnectionMigrationCallbacks = {
      beforeMigrateTenant() {},
      onTenantMigrationsFinished() {},
    };
    const onTenantMigrationsFinishedSpy = vi.spyOn(
      callback,
      'onTenantMigrationsFinished'
    );
    const beforeMigrateTenantSpy = vi.spyOn(callback, 'beforeMigrateTenant');

    vi.spyOn(MultiConnectionClient, 'getInstance').mockReturnValueOnce({
      connect() {},
    } as unknown as MultiConnectionClient);

    vi.spyOn(migrateUpFunctions, 'migrateUpTo').mockReturnValue(
      new Promise(async (resolve) => {
        resolve([
          {
            executionTimeInMs: 100,
            migrationName: 'xyz',
          },
        ]);
      })
    );

    await migrateTenantsUpTo('xyz', databaseConfiguration, '', callback);

    expect(beforeMigrateTenantSpy.mock.calls).toEqual([
      ['1', 'First Tenant'],
      ['2', 'Second Tenant'],
      ['3', 'Third Tenant'],
    ]);

    expect(onTenantMigrationsFinishedSpy.mock.calls).toEqual([
      [
        {
          tenantId: '1',
          tenantName: 'First Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
      [
        {
          tenantId: '2',
          tenantName: 'Second Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
      [
        {
          tenantId: '3',
          tenantName: 'Third Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
    ]);
  });

  test('Should migrate all tenants one specific migration up', async () => {
    const { databaseConfiguration } = getMocks();
    const callback: MultiConnectionMigrationCallbacks = {
      beforeMigrateTenant() {},
      onTenantMigrationsFinished() {},
    };
    const onTenantMigrationsFinishedSpy = vi.spyOn(
      callback,
      'onTenantMigrationsFinished'
    );
    const beforeMigrateTenantSpy = vi.spyOn(callback, 'beforeMigrateTenant');

    vi.spyOn(MultiConnectionClient, 'getInstance').mockReturnValueOnce({
      connect() {},
    } as unknown as MultiConnectionClient);

    vi.spyOn(migrateUpFunctions, 'migrateOneUp').mockReturnValue(
      new Promise(async (resolve) => {
        resolve({
          executionTimeInMs: 100,
          migrationName: 'xyz',
        });
      })
    );

    await migrateTenantsOneUp('xyz', databaseConfiguration, '', callback);

    expect(beforeMigrateTenantSpy.mock.calls).toEqual([
      ['1', 'First Tenant'],
      ['2', 'Second Tenant'],
      ['3', 'Third Tenant'],
    ]);

    expect(onTenantMigrationsFinishedSpy.mock.calls).toEqual([
      [
        {
          tenantId: '1',
          tenantName: 'First Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
      [
        {
          tenantId: '2',
          tenantName: 'Second Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
      [
        {
          tenantId: '3',
          tenantName: 'Third Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
    ]);
  });

  test('Should stop migrating if an error occured', async () => {
    const { databaseConfiguration } = getMocks();
    const callback: MultiConnectionMigrationCallbacks = {
      beforeMigrateTenant() {},
      onTenantMigrationsFinished() {},
    };
    const onTenantMigrationsFinishedSpy = vi.spyOn(
      callback,
      'onTenantMigrationsFinished'
    );
    const beforeMigrateTenantSpy = vi.spyOn(callback, 'beforeMigrateTenant');

    vi.spyOn(MultiConnectionClient, 'getInstance').mockReturnValueOnce({
      connect() {},
    } as unknown as MultiConnectionClient);

    vi.spyOn(migrateUpFunctions, 'migrateUpToEnd')
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve([
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ]);
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve([
            {
              error: new Error('Important error'),
              stopMigrationProcess: true,
            },
          ]);
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve([
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ]);
        })
      );

    await migrateTenantsUpToEnd(databaseConfiguration, '', callback);

    expect(beforeMigrateTenantSpy.mock.calls).toEqual([
      ['1', 'First Tenant'],
      ['2', 'Second Tenant'],
    ]);

    expect(onTenantMigrationsFinishedSpy.mock.calls).toEqual([
      [
        {
          tenantId: '1',
          tenantName: 'First Tenant',
          results: [
            {
              executionTimeInMs: 100,
              migrationName: 'xyz',
            },
          ],
        },
      ],
      [
        {
          tenantId: '2',
          tenantName: 'Second Tenant',
          results: [
            {
              error: new Error('Important error'),
              stopMigrationProcess: true,
            },
          ],
        },
      ],
    ]);
  });
});
