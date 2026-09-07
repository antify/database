import {
  describe, test, expect, vi,
} from 'vitest';
import {
  MigrationContext, SearchIndexDescription,
} from '../MigrationContext';
import {
  Client,
} from '../../client/Client';

describe('MigrationContext search index test', async () => {
  const readyIndex = {
    name: 'car_search',
    status: 'READY',
    queryable: true,
  };

  const getContext = <T>(collection: T): MigrationContext => {
    const db = {
      collection: vi.fn(() => collection),
    };
    const client = {
      getConnection: () => ({
        db,
      }),
    };

    return new MigrationContext(client as unknown as Client);
  };

  test('Should create a search index and wait until it is ready', async () => {
    const description = {
      name: 'car_search',
      definition: {
        mappings: {
          dynamic: true,
        },
      },
    };
    const collection = {
      createSearchIndex: vi.fn(async () => 'car_search'),
      listSearchIndexes: vi.fn(() => ({
        toArray: async () => [
          readyIndex,
        ],
      })),
    };
    const context = getContext(collection);

    const name = await context.createSearchIndex('cars', description);

    expect(name).toStrictEqual('car_search');
    expect(collection.createSearchIndex).toBeCalledWith(description);
    expect(collection.listSearchIndexes).toBeCalledWith('car_search');
  });

  test('Should not wait when waitForReady is false', async () => {
    const collection = {
      createSearchIndex: vi.fn(async () => 'car_search'),
      listSearchIndexes: vi.fn(),
    };
    const context = getContext(collection);

    await context.createSearchIndex('cars', {
      name: 'car_search',
      definition: {},
    }, {
      waitForReady: false,
    });

    expect(collection.listSearchIndexes).not.toBeCalled();
  });

  test('Should poll until the index is ready', async () => {
    const collection = {
      createSearchIndex: vi.fn(async () => 'car_search'),
      listSearchIndexes: vi.fn()
        .mockReturnValueOnce({
          toArray: async () => [
            {
              name: 'car_search',
              status: 'BUILDING',
              queryable: false,
            },
          ],
        })
        .mockReturnValue({
          toArray: async () => [
            readyIndex,
          ],
        }),
    };
    const context = getContext(collection);

    await context.createSearchIndex('cars', {
      name: 'car_search',
      definition: {},
    }, {
      pollIntervalInMs: 10,
    });

    expect(collection.listSearchIndexes).toBeCalledTimes(2);
  });

  test('Should throw when the index build failed', async () => {
    const collection = {
      createSearchIndex: vi.fn(async () => 'car_search'),
      listSearchIndexes: vi.fn(() => ({
        toArray: async () => [
          {
            name: 'car_search',
            status: 'FAILED',
            queryable: false,
          },
        ],
      })),
    };
    const context = getContext(collection);

    await expect(context.createSearchIndex('cars', {
      name: 'car_search',
      definition: {},
    })).rejects.toThrow('Search index "car_search" on collection "cars" failed to build');
  });

  test('Should throw when the index is not ready within the timeout', async () => {
    const collection = {
      listSearchIndexes: vi.fn(() => ({
        toArray: async () => [
          {
            name: 'car_search',
            status: 'BUILDING',
            queryable: false,
          },
        ],
      })),
    };
    const context = getContext(collection);

    await expect(context.waitForSearchIndex('cars', 'car_search', {
      timeoutInMs: 60,
      pollIntervalInMs: 10,
    })).rejects.toThrow('Search index "car_search" on collection "cars" is not ready after 60ms (last status: BUILDING)');
  });

  test('Should update a search index and wait by default', async () => {
    const definition = {
      mappings: {
        dynamic: true,
        fields: {
          farbe: {
            type: 'string',
          },
        },
      },
    };
    const collection = {
      updateSearchIndex: vi.fn(async () => {}),
      listSearchIndexes: vi.fn(() => ({
        toArray: async () => [
          readyIndex,
        ],
      })),
    };
    const context = getContext(collection);

    await context.updateSearchIndex('cars', 'car_search', definition);

    expect(collection.updateSearchIndex).toBeCalledWith('car_search', definition);
    expect(collection.listSearchIndexes).toBeCalledWith('car_search');

    collection.listSearchIndexes.mockClear();

    await context.updateSearchIndex('cars', 'car_search', definition, {
      waitForReady: false,
    });

    expect(collection.listSearchIndexes).not.toBeCalled();
  });

  test('Should drop a search index without waiting', async () => {
    const collection = {
      dropSearchIndex: vi.fn(async () => {}),
      listSearchIndexes: vi.fn(),
    };
    const context = getContext(collection);

    await context.dropSearchIndex('cars', 'car_search');

    expect(collection.dropSearchIndex).toBeCalledWith('car_search');
    expect(collection.listSearchIndexes).not.toBeCalled();
  });

  test('Should list search indexes with and without name', async () => {
    const collection = {
      listSearchIndexes: vi.fn(() => ({
        toArray: async () => [
          readyIndex,
        ],
      })),
    };
    const context = getContext(collection);

    const indexes = await context.listSearchIndexes('cars');

    expect(indexes).toStrictEqual([
      readyIndex,
    ]);
    expect(collection.listSearchIndexes).toBeCalledWith();

    await context.listSearchIndexes('cars', 'car_search');

    expect(collection.listSearchIndexes).toBeCalledWith('car_search');
  });

  test('Should create multiple search indexes and wait for each', async () => {
    const collection = {
      createSearchIndexes: vi.fn(async () => [
        'a',
        'b',
      ]),
      listSearchIndexes: vi.fn(() => ({
        toArray: async () => [
          readyIndex,
        ],
      })),
    };
    const context = getContext(collection);

    const names = await context.createSearchIndexes('cars', [
      {
        name: 'a',
        definition: {},
      },
      {
        name: 'b',
        definition: {},
      },
    ], {
      pollIntervalInMs: 10,
    });

    expect(names).toStrictEqual([
      'a',
      'b',
    ]);
    expect(collection.createSearchIndexes).toBeCalledWith([
      {
        name: 'a',
        definition: {},
      },
      {
        name: 'b',
        definition: {},
      },
    ]);
    expect(collection.listSearchIndexes).toBeCalledTimes(2);
  });

  test('Should forward the vectorSearch type', async () => {
    const description: SearchIndexDescription = {
      name: 'car_embeddings',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: 768,
            similarity: 'cosine',
          },
        ],
      },
    };
    const collection = {
      createSearchIndex: vi.fn(async () => 'car_embeddings'),
      listSearchIndexes: vi.fn(() => ({
        toArray: async () => [
          {
            name: 'car_embeddings',
            status: 'READY',
            queryable: true,
          },
        ],
      })),
    };
    const context = getContext(collection);

    await context.createSearchIndex('cars', description);

    expect(collection.createSearchIndex).toBeCalledWith(description);
  });

  test('Should throw when the database connection is not initialized', async () => {
    const client = {
      getConnection: () => ({
        db: null,
      }),
    };
    const context = new MigrationContext(client as unknown as Client);

    await expect(context.createSearchIndex('cars', {
      name: 'car_search',
      definition: {},
    })).rejects.toThrow('Database connection is not initialized');
    await expect(context.listSearchIndexes('cars')).rejects.toThrow('Database connection is not initialized');
  });
});
