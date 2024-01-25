import { describe, test, expect } from 'vitest';
import { MultiConnectionDatabaseConfiguration } from '../../types';
import { MultiConnectionClient } from '../MultiConnectionClient';
import { truncateAllCollections } from '../utils';

describe('utils test', async () => {
  const connectionUrl = 'mongodb://root:root@127.0.0.1:27017';

  test('should truncate all collections correctly', async () => {
    const client = await MultiConnectionClient.getInstance({
      databaseUrl: connectionUrl,
    } as MultiConnectionDatabaseConfiguration).connect(
      'clear_all_collections_test'
    );

    const testSchema = {
      name: {
        type: String,
      },
    };

    const testData = [
      {
        name: 'foo',
      },
      {
        name: 'bar',
      },
    ];

    client.getSchema('first_collections').add(testSchema);
    client.getSchema('second_collections').add(testSchema);

    const FirstCollectionModel = client.getModel('first_collections');
    const SecondCollectionModel = client.getModel('second_collections');

    await Promise.all([
      FirstCollectionModel.insertMany(testData),
      SecondCollectionModel.insertMany(testData),
    ]);

    truncateAllCollections(client.getConnection());

    // This test fails without this timeout. Don't know why.
    await new Promise((resolve) => {
      setTimeout(() => resolve(true), 100);
    });

    expect(await FirstCollectionModel.find({})).toHaveLength(0);
    expect(await SecondCollectionModel.find({})).toHaveLength(0);
  });
});
