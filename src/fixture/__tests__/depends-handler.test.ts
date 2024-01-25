import { describe, test, expect } from 'vitest';
import { sortFixturesByDependency } from '../depends-handler';
import { generateFixtureMocks } from './utils';

describe('Depends handler test', async () => {
  test('Should sort fixtures in correct order', async () => {
    const fixtures = generateFixtureMocks([
      'one',
      'two',
      'three',
      'four',
      'five',
    ]);

    fixtures[0].dependsOn = () => ['two'];
    fixtures[2].dependsOn = () => ['four', 'five'];

    const sortedFixtures = sortFixturesByDependency(fixtures);

    expect(sortedFixtures[0].name).toBe('two');
    expect(sortedFixtures[1].name).toBe('one');
    expect(sortedFixtures[2].name).toBe('four');
    expect(sortedFixtures[3].name).toBe('five');
    expect(sortedFixtures[4].name).toBe('three');
  });

  test('Should not allow to depends on self', async () => {
    const fixtures = generateFixtureMocks(['one']);

    fixtures[0].dependsOn = () => ['one'];

    expect(() => sortFixturesByDependency(fixtures)).toThrowError(
      'Fixture one can not depend on itself.'
    );
  });

  test('Should not allow infinite dependency recursion', async () => {
    const fixtures = generateFixtureMocks(['one', 'two']);

    fixtures[0].dependsOn = () => ['two'];
    fixtures[1].dependsOn = () => ['one'];

    expect(() => sortFixturesByDependency(fixtures)).toThrowError(
      'Infinite depedency cyrcle detected. Fixture one and two depends on each other.'
    );
  });
});
