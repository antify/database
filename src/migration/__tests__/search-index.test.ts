import {
  describe, test, expect, beforeAll, afterAll,
} from 'vitest';
import {
  SingleConnectionClient,
} from '../../client/SingleConnectionClient';
import {
  MultiConnectionClient,
} from '../../client/MultiConnectionClient';
import {
  MultiConnectionDatabaseConfiguration, SingleConnectionDatabaseConfiguration,
} from '../../types';
import {
  MigrationContext,
} from '../MigrationContext';

describe('Search index test', async () => {
  const connectionUrl = 'mongodb://root:root@127.0.0.1:27017/search-index-test?directConnection=true';
  let client: SingleConnectionClient;
  let multiClient: MultiConnectionClient;

  const getDb = (connectionClient: SingleConnectionClient | MultiConnectionClient) => {
    const db = connectionClient.getConnection().db;

    if (!db) {
      throw new Error('Database connection is not initialized');
    }

    return db;
  };

  const waitFor = async (
    condition: () => Promise<boolean>,
    timeoutInMs = 60000,
  ): Promise<void> => {
    const deadline = Date.now() + timeoutInMs;

    while (Date.now() < deadline) {
      if (await condition()) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error('Condition was not met in time');
  };

  beforeAll(async () => {
    client = SingleConnectionClient.getInstance({
      databaseUrl: connectionUrl,
      isSingleConnection: true,
      migrationDir: '',
    } as SingleConnectionDatabaseConfiguration);
    await client.connect();

    // Fresh state, so re-running the suite does not conflict with existing indexes.
    await getDb(client).dropDatabase();
    await getDb(client).createCollection('cars');

    multiClient = MultiConnectionClient.getInstance({
      databaseUrl: 'mongodb://root:root@127.0.0.1:27017?directConnection=true',
      isSingleConnection: false,
      migrationDir: '',
      fetchTenants: async () => [],
    } as MultiConnectionDatabaseConfiguration);
  }, 120000);

  afterAll(async () => {
    await getDb(client).dropDatabase();

    await multiClient.connect('si1');
    await getDb(multiClient).dropDatabase();

    await multiClient.connect('si2');
    await getDb(multiClient).dropDatabase();
  }, 120000);

  test('Should create a search index and wait until it is ready', async () => {
    const context = new MigrationContext(client);

    const name = await context.createSearchIndex('cars', {
      name: 'car_search',
      definition: {
        mappings: {
          dynamic: true,
        },
      },
    });

    expect(name).toStrictEqual('car_search');

    const indexes = await context.listSearchIndexes('cars', 'car_search');

    expect(indexes).toHaveLength(1);
    expect(indexes[0].status).toStrictEqual('READY');
    expect(indexes[0].queryable).toBe(true);
  }, 180000);

  test('Should update a search index and wait until the rebuild is done', async () => {
    const context = new MigrationContext(client);

    await context.updateSearchIndex('cars', 'car_search', {
      mappings: {
        dynamic: true,
        fields: {
          farbe: {
            type: 'string',
          },
        },
      },
    });

    const indexes = await context.listSearchIndexes('cars', 'car_search');

    expect(indexes).toHaveLength(1);
    expect(indexes[0].latestDefinition?.mappings?.fields?.farbe).toBeTruthy();
  }, 180000);

  test('Should support manual waiting', async () => {
    const context = new MigrationContext(client);

    await context.createSearchIndex('cars', {
      name: 'car_search_2',
      definition: {
        mappings: {
          dynamic: true,
        },
      },
    }, {
      waitForReady: false,
    });

    await context.waitForSearchIndex('cars', 'car_search_2');

    const indexes = await context.listSearchIndexes('cars', 'car_search_2');

    expect(indexes).toHaveLength(1);
    expect(indexes[0].status).toStrictEqual('READY');
  }, 180000);

  test('Should drop a search index', async () => {
    const context = new MigrationContext(client);

    await context.dropSearchIndex('cars', 'car_search');

    // Dropping is asynchronous on Atlas, so poll until the index disappeared.
    await waitFor(async () => (await context.listSearchIndexes('cars', 'car_search')).length === 0);
  }, 180000);

  test('Should scope search indexes to the tenant database', async () => {
    await multiClient.connect('si1');
    await getDb(multiClient).dropDatabase();
    await getDb(multiClient).createCollection('cars');

    const context1 = new MigrationContext(multiClient);

    await context1.createSearchIndex('cars', {
      name: 'tenant_car_search',
      definition: {
        mappings: {
          dynamic: true,
        },
      },
    });

    await multiClient.connect('si2');
    await getDb(multiClient).createCollection('cars');

    const context2 = new MigrationContext(multiClient);
    const indexes2 = await context2.listSearchIndexes('cars');

    expect(indexes2).toHaveLength(0);

    await multiClient.connect('si1');

    const context1Again = new MigrationContext(multiClient);
    const indexes1 = await context1Again.listSearchIndexes('cars', 'tenant_car_search');

    expect(indexes1).toHaveLength(1);
    expect(indexes1[0].status).toStrictEqual('READY');
  }, 180000);
});
