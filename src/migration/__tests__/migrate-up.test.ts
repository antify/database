import { describe, test, expect, vi, afterEach } from 'vitest';
import { SingleConnectionClient } from '../../client/SingleConnectionClient';
import {
  defineMigration,
  SingleConnectionDatabaseConfiguration,
} from '../../types';
import {
  migrateOneUp,
  migrateUpTo,
  migrateUpToEnd,
  MigrationCallbacks,
} from '../migrate-up';
import { Migrator } from '../migrator';
import { MigrationState } from '../migration-state';
import { generateMigrationMocks } from './utils';
import { Model } from 'mongoose';

// TODO:: Tests return values too not only callback functionallity.

describe('Migrate up test', async () => {
  const getMocks = () => {
    const migrationMocks = generateMigrationMocks([
      'test-1',
      'test-2',
      'test-3',
    ]);

    const databaseConfiguration: SingleConnectionDatabaseConfiguration = {
      databaseUrl: 'mongodb://root:root@localhost:27017/migrate-up-test',
      isSingleConnection: true,
      migrationDir: '',
    };
    const client = SingleConnectionClient.getInstance(databaseConfiguration);
    const migrator = new Migrator(client, databaseConfiguration, '');

    vi.spyOn(client, 'getModel').mockImplementation(
      <T>(modelName: string): Model<T> => {
        return {
          create: async () => {},
        } as unknown as Model<T>;
      }
    );

    return { migrator, client, migrationMocks };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should migrate up to end', async () => {
    const { migrator, migrationMocks } = getMocks();
    const callback: MigrationCallbacks = {
      onMigrationFinished(executionResult) {},
    };
    const onMigrationFinishedSpy = vi.spyOn(callback, 'onMigrationFinished');

    vi.spyOn(migrator, 'loadMigrationState')
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, []));
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, []));
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, ['test-1']));
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, ['test-1', 'test-2']));
        })
      );

    await migrateUpToEnd(migrator, callback);

    expect(onMigrationFinishedSpy.mock.calls).toHaveLength(3);
    expect(onMigrationFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'executionTimeInMs'
    );
    expect(onMigrationFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'migrationName',
      'test-1'
    );
    expect(onMigrationFinishedSpy.mock.calls[1][0]).toHaveProperty(
      'migrationName',
      'test-2'
    );
    expect(onMigrationFinishedSpy.mock.calls[1][0]).toHaveProperty(
      'executionTimeInMs'
    );
    expect(onMigrationFinishedSpy.mock.calls[2][0]).toHaveProperty(
      'migrationName',
      'test-3'
    );
    expect(onMigrationFinishedSpy.mock.calls[2][0]).toHaveProperty(
      'executionTimeInMs'
    );
  });

  test('Should migrate up to a specific migration', async () => {
    const { migrator, migrationMocks } = getMocks();
    const callback: MigrationCallbacks = {
      onMigrationFinished(executionResult) {},
    };
    const onMigrationFinishedSpy = vi.spyOn(callback, 'onMigrationFinished');

    vi.spyOn(migrator, 'loadMigrationState')
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, []));
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, []));
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, ['test-1']));
        })
      );

    await migrateUpTo('test-2', migrator, callback);

    expect(onMigrationFinishedSpy.mock.calls).toHaveLength(2);
    expect(onMigrationFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'executionTimeInMs'
    );
    expect(onMigrationFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'migrationName',
      'test-1'
    );
    expect(onMigrationFinishedSpy.mock.calls[1][0]).toHaveProperty(
      'migrationName',
      'test-2'
    );
    expect(onMigrationFinishedSpy.mock.calls[1][0]).toHaveProperty(
      'executionTimeInMs'
    );
  });

  test('Should migrate one specific migration up', async () => {
    const { migrator, migrationMocks } = getMocks();
    const callback: MigrationCallbacks = {
      onMigrationFinished(executionResult) {},
    };
    const onMigrationFinishedSpy = vi.spyOn(callback, 'onMigrationFinished');

    vi.spyOn(migrator, 'loadMigrationState')
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, []));
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, []));
        })
      );

    await migrateOneUp('test-1', migrator, callback);

    expect(onMigrationFinishedSpy.mock.calls).toHaveLength(1);
    expect(onMigrationFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'executionTimeInMs'
    );
    expect(onMigrationFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'migrationName',
      'test-1'
    );
  });

  test('Should not migrate a not existing migration', async () => {
    const { migrator, migrationMocks } = getMocks();
    const callback: MigrationCallbacks = {
      onMigrationFinished(executionResult) {},
    };

    vi.spyOn(migrator, 'loadMigrationState').mockReturnValueOnce(
      new Promise(async (resolve) => {
        resolve(new MigrationState(migrationMocks, []));
      })
    );

    vi.spyOn(callback, 'onMigrationFinished');

    await migrateOneUp('test-45', migrator, callback);
    expect(callback.onMigrationFinished).toBeCalledWith({
      error: new Error('Migration test-45 does not exists'),
    });
  });

  test('Should not migrate an already migrated migration', async () => {
    const { migrator, migrationMocks } = getMocks();
    const callback: MigrationCallbacks = {
      onMigrationFinished(executionResult) {},
    };

    vi.spyOn(migrator, 'loadMigrationState').mockReturnValueOnce(
      new Promise(async (resolve) => {
        resolve(new MigrationState(migrationMocks, ['test-1']));
      })
    );

    vi.spyOn(callback, 'onMigrationFinished');

    await migrateOneUp('test-1', migrator, callback);
    expect(callback.onMigrationFinished).toBeCalledWith({
      error: new Error('Migration test-1 already executed'),
    });
  });

  test('Should not migrate a migration which has not executed migrations before', async () => {
    const { migrator, migrationMocks } = getMocks();
    const callback: MigrationCallbacks = {
      onMigrationFinished(executionResult) {},
    };
    vi.spyOn(migrator, 'loadMigrationState').mockReturnValue(
      new Promise((resolve) => {
        resolve(new MigrationState(migrationMocks, []));
      })
    );

    vi.spyOn(callback, 'onMigrationFinished');
    await migrateOneUp('test-2', migrator, callback);
    expect(callback.onMigrationFinished).toBeCalledWith({
      error: new Error(
        'Can not execute migration test-2 because there are not executed migrations before'
      ),
    });
  });

  test('Should stop migrating if an error occured', async () => {
    const { migrator } = getMocks();
    const migrationMocks = [
      defineMigration({
        name: 'test-1',
        async up() {},
        async down() {},
      }),
      defineMigration({
        name: 'test-2',
        async up() {
          throw new Error('Some failure happened');
        },
        async down() {},
      }),
      defineMigration({
        name: 'test-3',
        async up() {},
        async down() {},
      }),
    ];
    const callback: MigrationCallbacks = {
      onMigrationFinished(executionResult) {},
    };
    const onMigrationFinishedSpy = vi.spyOn(callback, 'onMigrationFinished');

    vi.spyOn(migrator, 'loadMigrationState')
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, []));
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, []));
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, ['test-1']));
        })
      )
      .mockReturnValueOnce(
        new Promise(async (resolve) => {
          resolve(new MigrationState(migrationMocks, ['test-1', 'test-2']));
        })
      );

    await migrateUpToEnd(migrator, callback);

    expect(onMigrationFinishedSpy.mock.calls).toHaveLength(2);
    expect(onMigrationFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'executionTimeInMs'
    );
    expect(onMigrationFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'migrationName',
      'test-1'
    );
    expect(onMigrationFinishedSpy.mock.calls[1][0]).toHaveProperty(
      'error',
      new Error('Some failure happened')
    );
  });

  test('Should show info if there are no migrations to execute', async () => {
    const { migrator } = getMocks();
    const callback: MigrationCallbacks = {
      onMigrationFinished(executionResult) {},
    };
    const onMigrationFinishedSpy = vi.spyOn(callback, 'onMigrationFinished');

    vi.spyOn(migrator, 'loadMigrationState').mockReturnValueOnce(
      new Promise(async (resolve) => {
        resolve(new MigrationState([], []));
      })
    );

    await migrateUpToEnd(migrator, callback);

    expect(onMigrationFinishedSpy.mock.calls).toHaveLength(1);
    expect(onMigrationFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'info',
      'No migrations to migrate'
    );
  });
});
