import {
  describe, test, expect,
} from 'vitest';
import {
  SingleConnectionDatabaseConfiguration,
} from '../../types';
import {
  SingleConnectionClient,
} from '../SingleConnectionClient';

describe('SingleConnectionClient test', async () => {
  const connectionUrl = 'mongodb://root:root@127.0.0.1:27017/test?directConnection=true';

  test('should connect correctly', async () => {
    const client = SingleConnectionClient.getInstance({
      databaseUrl: connectionUrl,
    } as SingleConnectionDatabaseConfiguration);

    await client.connect();

    const adminUtil = client.getConnection().db.admin();
    const result = await adminUtil.ping();

    // A replica set adds "$clusterTime" and "operationTime" to the response.
    expect(result.ok).toStrictEqual(1);
  });
});
