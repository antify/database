import { describe, test, expect, vi, afterEach } from 'vitest';
import { MultiConnectionDatabaseConfiguration } from '../../types';
import {
  loadFixturesMulticonnection,
  MultiConnectionLoadFixtureCallbacks,
} from '../load-fixtures-multi';
import * as loadFixturesFunctions from '../load-fixtures';

describe('Load fixtures multi connection test', async () => {
  const getMocks = () => {
    const databaseConfiguration: MultiConnectionDatabaseConfiguration = {
      databaseUrl: '',
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

  test('Should load all fixtures for all tenants', async () => {
    const { databaseConfiguration } = getMocks();
    const callback: MultiConnectionLoadFixtureCallbacks = {
      beforeLoadFixtureTenant() {},
      onTenantLoadFixturesFinished() {},
    };
    const onTenantLoadFixturesFinishedSpy = vi.spyOn(
      callback,
      'onTenantLoadFixturesFinished'
    );
    const beforeLoadFixtureTenantSpy = vi.spyOn(
      callback,
      'beforeLoadFixtureTenant'
    );

    vi.mock('../../client/MultiConnectionClient', () => ({
      MultiConnectionClient: {
        getInstance: () => ({
          connect: async () => {},
        }),
      },
    }));

    vi.spyOn(loadFixturesFunctions, 'loadFixtures').mockReturnValue(
      new Promise(async (resolve) => {
        resolve([
          {
            executionTimeInMs: 100,
            fixtureName: 'xyz',
          },
        ]);
      })
    );

    await loadFixturesMulticonnection(databaseConfiguration, '', callback);

    expect(beforeLoadFixtureTenantSpy.mock.calls).toEqual([
      ['1', 'First Tenant'],
      ['2', 'Second Tenant'],
      ['3', 'Third Tenant'],
    ]);

    expect(onTenantLoadFixturesFinishedSpy.mock.calls).toEqual([
      [
        {
          tenantId: '1',
          tenantName: 'First Tenant',
          results: [
            {
              executionTimeInMs: 100,
              fixtureName: 'xyz',
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
              fixtureName: 'xyz',
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
              fixtureName: 'xyz',
            },
          ],
        },
      ],
    ]);
  });

  test('Should stop loading fixtures if an error occured', async () => {
    const { databaseConfiguration } = getMocks();
    const callback: MultiConnectionLoadFixtureCallbacks = {
      beforeLoadFixtureTenant() {},
      onTenantLoadFixturesFinished() {},
    };
    const onTenantLoadFixturesFinishedSpy = vi.spyOn(
      callback,
      'onTenantLoadFixturesFinished'
    );
    const beforeLoadFixtureTenantSpy = vi.spyOn(
      callback,
      'beforeLoadFixtureTenant'
    );

    vi.mock('../../client/MultiConnectionClient', () => ({
      MultiConnectionClient: {
        getInstance: () => ({
          connect: async () => {},
        }),
      },
    }));

    vi.spyOn(loadFixturesFunctions, 'loadFixtures').mockReturnValue(
      new Promise(async (resolve) => {
        resolve([
          {
            executionTimeInMs: 100,
            fixtureName: 'xyz',
          },
        ]);
      })
    );

    vi.spyOn(loadFixturesFunctions, 'loadFixtures')
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve([
            {
              executionTimeInMs: 100,
              fixtureName: 'xyz',
            },
          ]);
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve([
            {
              error: new Error('Important error'),
              stopLoadFixtureProcess: true,
            },
          ]);
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve([
            {
              executionTimeInMs: 100,
              fixtureName: 'xyz',
            },
          ]);
        })
      );

    await loadFixturesMulticonnection(databaseConfiguration, '', callback);

    expect(beforeLoadFixtureTenantSpy.mock.calls).toEqual([
      ['1', 'First Tenant'],
      ['2', 'Second Tenant'],
    ]);

    expect(onTenantLoadFixturesFinishedSpy.mock.calls).toEqual([
      [
        {
          tenantId: '1',
          tenantName: 'First Tenant',
          results: [
            {
              executionTimeInMs: 100,
              fixtureName: 'xyz',
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
              stopLoadFixtureProcess: true,
            },
          ],
        },
      ],
    ]);
  });
});
