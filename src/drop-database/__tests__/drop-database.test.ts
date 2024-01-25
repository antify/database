import { describe, test, expect } from 'vitest';
import { SingleConnectionClient } from '../../client/SingleConnectionClient';
import { dropDatabase } from '../drop-database';
import { SingleConnectionDatabaseConfiguration } from '../../types';
import { createDatabaseWithDummyRecord } from './utils';
import { doesDatabaseExist } from '../../utils';

describe('Drop database test', async () => {
  test('Should drop a database', async () => {
    const dbName = 'drop-database-test';
    const databaseConfiguration: SingleConnectionDatabaseConfiguration = {
      databaseUrl: `mongodb://root:root@localhost:27017/${dbName}`,
      isSingleConnection: true,
      migrationDir: '',
    };
    const client = SingleConnectionClient.getInstance(databaseConfiguration);

    // To create a database, create one record.
    await client.connect();
    await createDatabaseWithDummyRecord(client);

    expect(await doesDatabaseExist(client.getConnection(), dbName)).toBeTruthy();

    await dropDatabase(client);

    expect(await doesDatabaseExist(client.getConnection(), dbName)).toBeFalsy();
  });
});
