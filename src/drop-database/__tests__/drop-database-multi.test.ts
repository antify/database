import { describe, test, expect, vi, afterEach } from 'vitest';
import { DropDatabaseResult, MultiConnectionDatabaseConfiguration } from '../../types';
import { MultiConnectionClient } from '../../client/MultiConnectionClient';
import { MultiConnectionDropDatabaseCallbacks, dropDatabaseMulti } from '../drop-database-multi';
import { createDatabaseWithDummyRecord } from './utils';
import { doesDatabaseExist } from '../../utils';

describe('Drop database multi test', async () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should drop all databases of a multi connection', async () => {
    const databaseConfiguration: MultiConnectionDatabaseConfiguration = {
      databaseUrl: 'mongodb://root:root@localhost:27017/drop-database-test',
      isSingleConnection: false,
      migrationDir: '',
      fetchTenants: async () => {
        return new Promise((resolve) => {
          resolve([
            { id: '64c39fcbcb7afc335881326e', name: 'Foo tenant' },
            { id: '64c76796b3854de74305dab8', name: 'Bar tenant' },
          ])
        })
      }
    };
    const client = MultiConnectionClient.getInstance(databaseConfiguration);
    const callbacks: MultiConnectionDropDatabaseCallbacks = {
      beforeDropDatabase() { },
      onDropDatabaseFinished() { },
    };
    const beforeDropDatabase = vi.spyOn(callbacks, 'beforeDropDatabase');
    const onDropDatabaseFinishedSpy = vi.spyOn(callbacks, 'onDropDatabaseFinished');

    await client.connect('64c39fcbcb7afc335881326e');
    await createDatabaseWithDummyRecord(client);
    expect(await doesDatabaseExist(client.getConnection(), 'tenant_64c39fcbcb7afc335881326e')).toBeTruthy();

    await client.connect('64c76796b3854de74305dab8');
    await createDatabaseWithDummyRecord(client);
    expect(await doesDatabaseExist(client.getConnection(), 'tenant_64c76796b3854de74305dab8')).toBeTruthy();

    await dropDatabaseMulti(databaseConfiguration, callbacks);

    expect(await doesDatabaseExist(client.getConnection(), 'tenant_64c39fcbcb7afc335881326e')).toBeFalsy();
    expect(await doesDatabaseExist(client.getConnection(), 'tenant_64c76796b3854de74305dab8')).toBeFalsy();

    expect(onDropDatabaseFinishedSpy.mock.calls).toHaveLength(2);

    expect((onDropDatabaseFinishedSpy.mock.calls[0][0] as DropDatabaseResult).tenantId).toBe('64c39fcbcb7afc335881326e');
    expect((onDropDatabaseFinishedSpy.mock.calls[0][0] as DropDatabaseResult).tenantName).toBe('Foo tenant');
    expect((onDropDatabaseFinishedSpy.mock.calls[0][0] as DropDatabaseResult).result.error).toBeNull();
    expect((onDropDatabaseFinishedSpy.mock.calls[0][0] as DropDatabaseResult).result.executionTimeInMs).toBeGreaterThan(0.5);

    expect((onDropDatabaseFinishedSpy.mock.calls[1][0] as DropDatabaseResult).tenantId).toBe('64c76796b3854de74305dab8');
    expect((onDropDatabaseFinishedSpy.mock.calls[1][0] as DropDatabaseResult).tenantName).toBe('Bar tenant');
    expect((onDropDatabaseFinishedSpy.mock.calls[1][0] as DropDatabaseResult).result.error).toBeNull();
    expect((onDropDatabaseFinishedSpy.mock.calls[1][0] as DropDatabaseResult).result.executionTimeInMs).toBeGreaterThan(0.5);

    expect(beforeDropDatabase.mock.calls).toStrictEqual([
      ['64c39fcbcb7afc335881326e', 'Foo tenant'],
      ['64c76796b3854de74305dab8', 'Bar tenant']
    ])
  });

  test('Should trigger event if no databases are there to delete', async () => {
    const databaseConfiguration: MultiConnectionDatabaseConfiguration = {
      databaseUrl: 'mongodb://root:root@localhost:27017/drop-database-test',
      isSingleConnection: false,
      migrationDir: '',
      fetchTenants: async () => {
        return new Promise((resolve) => {
          resolve([])
        })
      }
    };
    const client = MultiConnectionClient.getInstance(databaseConfiguration);
    const callbacks: MultiConnectionDropDatabaseCallbacks = {
      onNoDatabasesToDrop() { },
    };
    const onNoDatabasesToDropSpy = vi.spyOn(callbacks, 'onNoDatabasesToDrop');

    await dropDatabaseMulti(databaseConfiguration, callbacks);

    expect(await doesDatabaseExist(client.getConnection(), 'tenant_64c39fcbcb7afc335881326e')).toBeFalsy();
    expect(await doesDatabaseExist(client.getConnection(), 'tenant_64c76796b3854de74305dab8')).toBeFalsy();

    expect(onNoDatabasesToDropSpy.mock.calls).toHaveLength(1);
  });
});
