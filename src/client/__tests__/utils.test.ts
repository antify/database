import { describe, test, expect, beforeEach, beforeAll } from 'vitest';
import { MultiConnectionDatabaseConfiguration } from '../../types';
import { MultiConnectionClient } from '../MultiConnectionClient';
import { truncateAllCollections, truncateCollections } from '../utils';
import { Model } from 'mongoose';

describe('utils test', async () => {
  const connectionUrl = 'mongodb://root:root@127.0.0.1:27017';
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
  const collections = [
    'first_collections',
    'second_collections',
    'third_collections'
  ];
  let models: Model<any>[];
  let client: MultiConnectionClient;

  beforeAll(async () => {
    client = await MultiConnectionClient.getInstance({
      databaseUrl: connectionUrl,
    } as MultiConnectionDatabaseConfiguration).connect(
      'utils_tests'
    );

    collections.forEach((collection) => client.getSchema(collection).add(testSchema));

    models = collections.map((collection) => client.getModel(collection));
  });

  beforeEach(async () => {
    // Truncate all collections
    await Promise.all(
      collections.map(async (collection) => {
        await client.getConnection().db.dropCollection(collection);
      })
    );

    // Seed each collection with test data
    await Promise.all(models.map((model) => model.insertMany(testData)));
  });

  test('should truncate all collections correctly', async () => {
    await truncateAllCollections(client.getConnection());

    const data = await Promise.all(models.map((model) => model.find({})));

    expect(data[0]).toHaveLength(0);
    expect(data[1]).toHaveLength(0);
    expect(data[2]).toHaveLength(0);
  });

  test('should truncate specific collections correctly', async () => {
    await truncateCollections(client.getConnection(), [collections[0], collections[1]]);

    const data = await Promise.all(models.map((model) => model.find({})));

    expect(data[0]).toHaveLength(0);
    expect(data[1]).toHaveLength(0);
    expect(data[2]).toHaveLength(2);
  });

  test('should not throw an error if specific collections does not exists', async () => {
    await truncateCollections(client.getConnection(), ['not_exists']);

    expect(true).toBe(true);
  });
});
