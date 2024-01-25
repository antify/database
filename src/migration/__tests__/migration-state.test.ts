import { describe, test, expect } from 'vitest';
import { MigrationState } from '../migration-state';
import { generateMigrationMocks } from './utils';

describe('state test', async () => {
  test('should initialize state correctly', async () => {
    let state = new MigrationState(
      generateMigrationMocks(['a', 'b', 'c', 'd', 'f']),
      ['a', 'b', 'e']
    );

    expect(state.available).toStrictEqual(['a', 'b', 'c', 'd', 'f']);
    expect(state.executed).toStrictEqual(['a', 'b', 'e']);
    expect(state.notExecuted).toStrictEqual(['c', 'd', 'f']);
    expect(state.missing).toStrictEqual(['e']);
    expect(state.latestVersion).toStrictEqual('f');
    expect(state.currentVersion).toStrictEqual('e');
    expect(state.nextVersion).toStrictEqual('f');
    expect(state.prevVersion).toStrictEqual('b');
  });

  test('should emit all not executed migrations from current to last executed one', async () => {
    const state = new MigrationState(
      generateMigrationMocks(['a', 'b', 'c', 'd', 'e', 'f']),
      ['b', 'd']
    );

    expect(state.getAllNotExecutedAfterCurrent()).toStrictEqual(['e', 'f']);
  });

  test('should emit all not executed migrations from current to given one', async () => {
    const state = new MigrationState(
      generateMigrationMocks(['a', 'b', 'c', 'd', 'e', 'f']),
      ['b', 'd']
    );

    expect(state.getAllNotExecutedAfter('c', true)).toStrictEqual([
      'c',
      'e',
      'f',
    ]);
    expect(state.getAllNotExecutedAfter('c', false)).toStrictEqual(['e', 'f']);
  });

  test('should emit all migrations from given one to end', async () => {
    const state = new MigrationState(
      generateMigrationMocks(['a', 'b', 'c', 'd', 'e', 'f']),
      ['b', 'd']
    );

    expect(
      state.getMigrationsAfter(['a', 'b', 'c', 'd', 'e', 'f'], 'c', true)
    ).toStrictEqual(['c', 'd', 'e', 'f']);
    expect(
      state.getMigrationsAfter(['a', 'b', 'c', 'd', 'e', 'f'], 'c', false)
    ).toStrictEqual(['d', 'e', 'f']);
  });
});
