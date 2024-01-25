import { describe, test, expect, vi, afterEach } from 'vitest';
import { SingleConnectionClient } from '../../client/SingleConnectionClient';
import {
  defineFixture,
  SingleConnectionDatabaseConfiguration,
} from '../../types';
import { generateFixtureMocks } from './utils';
import { LoadFixtureCallbacks, loadFixtures } from '../load-fixtures';
import * as fileHandler from '../file-handler';

describe('Load fixtures test', async () => {
  const getMocks = () => {
    const fixtureMocks = generateFixtureMocks(['test-1', 'test-2', 'test-3']);
    const databaseConfiguration: SingleConnectionDatabaseConfiguration = {
      databaseUrl: '',
      isSingleConnection: true,
      migrationDir: '',
    };
    const client = SingleConnectionClient.getInstance(databaseConfiguration);

    return { client, fixtureMocks, databaseConfiguration };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should load and execute all fixtures', async () => {
    const { databaseConfiguration, client, fixtureMocks } = getMocks();
    const callback: LoadFixtureCallbacks = {
      onLoadFixtureFinished(executionResult) {},
    };
    const onLoadFixtureFinishedSpy = vi.spyOn(
      callback,
      'onLoadFixtureFinished'
    );

    vi.spyOn(fileHandler, 'loadFixturesFromFilesystem').mockReturnValue(
      fixtureMocks
    );

    const result = await loadFixtures(
      databaseConfiguration,
      '',
      client,
      callback
    );

    expect(result).toHaveLength(3);
    expect(result[0].fixtureName).toBe('test-1');
    expect(result[1].fixtureName).toBe('test-2');
    expect(result[2].fixtureName).toBe('test-3');

    expect(onLoadFixtureFinishedSpy.mock.calls).toHaveLength(3);
    expect(onLoadFixtureFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'executionTimeInMs'
    );
    expect(onLoadFixtureFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'fixtureName',
      'test-1'
    );
    expect(onLoadFixtureFinishedSpy.mock.calls[1][0]).toHaveProperty(
      'fixtureName',
      'test-2'
    );
    expect(onLoadFixtureFinishedSpy.mock.calls[1][0]).toHaveProperty(
      'executionTimeInMs'
    );
    expect(onLoadFixtureFinishedSpy.mock.calls[2][0]).toHaveProperty(
      'fixtureName',
      'test-3'
    );
    expect(onLoadFixtureFinishedSpy.mock.calls[2][0]).toHaveProperty(
      'executionTimeInMs'
    );
  });

  test('Should stop loading fixtures if an error occured', async () => {
    const { databaseConfiguration, client } = getMocks();
    const fixtureMocks = [
      defineFixture({
        name: 'test-1',
        async load() {},
        dependsOn() {
          return [];
        },
      }),
      defineFixture({
        name: 'test-2',
        async load() {
          throw new Error('Some failure happened');
        },
        dependsOn() {
          return [];
        },
      }),
      defineFixture({
        name: 'test-3',
        async load() {},
        dependsOn() {
          return [];
        },
      }),
    ];
    const callback: LoadFixtureCallbacks = {
      onLoadFixtureFinished(executionResult) {},
    };
    const onLoadFixtureFinishedSpy = vi.spyOn(
      callback,
      'onLoadFixtureFinished'
    );

    vi.spyOn(fileHandler, 'loadFixturesFromFilesystem').mockReturnValue(
      fixtureMocks
    );

    const result = await loadFixtures(
      databaseConfiguration,
      '',
      client,
      callback
    );

    expect(onLoadFixtureFinishedSpy.mock.calls).toHaveLength(2);
    expect(onLoadFixtureFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'executionTimeInMs'
    );
    expect(onLoadFixtureFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'fixtureName',
      'test-1'
    );
    expect(onLoadFixtureFinishedSpy.mock.calls[1][0]).toHaveProperty(
      'error',
      new Error('Some failure happened')
    );
  });

  test('Should show info if there are no fixtures to load', async () => {
    const { databaseConfiguration, client, fixtureMocks } = getMocks();
    const callback: LoadFixtureCallbacks = {
      onLoadFixtureFinished(executionResult) {},
    };
    const onLoadFixtureFinishedSpy = vi.spyOn(
      callback,
      'onLoadFixtureFinished'
    );

    vi.spyOn(fileHandler, 'loadFixturesFromFilesystem').mockReturnValue([]);

    const result = await loadFixtures(
      databaseConfiguration,
      '',
      client,
      callback
    );

    expect(result).toHaveLength(0);

    expect(onLoadFixtureFinishedSpy.mock.calls).toHaveLength(1);
    expect(onLoadFixtureFinishedSpy.mock.calls[0][0]).toHaveProperty(
      'info',
      'No fixtures to load'
    );
  });
});
