import { describe, test, expect } from 'vitest';
import { MultiConnectionDatabaseConfiguration } from '../../types';
import { MultiConnectionClient } from '../MultiConnectionClient';

describe('MultiConnectionClient test', async () => {
  const connectionUrl = 'mongodb://root:root@127.0.0.1:27017';

  test('should connect correctly', async () => {
    const client = MultiConnectionClient.getInstance({
      databaseUrl: connectionUrl,
    } as MultiConnectionDatabaseConfiguration);

    await client.connect('1');

    const adminUtil = client.getConnection().db.admin();
    const result = await adminUtil.ping();

    expect(result).toStrictEqual({ ok: 1 });
  });

  test('should switch connection correctly', async () => {
    const client = MultiConnectionClient.getInstance({
      databaseUrl: connectionUrl,
    } as MultiConnectionDatabaseConfiguration);

    await client.connect('1');
    await client.connect('2');

    const adminUtil = client.getConnection().db.admin();
    const result = await adminUtil.ping();

    expect(result).toStrictEqual({ ok: 1 });
  });
});
