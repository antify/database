import { Fixture } from '../types';

export const sortFixturesByDependency = (fixtures: Fixture[]): Fixture[] => {
  for (const fixture of fixtures) {
    if (!fixture.name) {
      throw new Error(`Can not sort fixtures without a valid name.`);
    }

    const dependencies = fixture.dependsOn();

    if (dependencies.some((fixtureName) => fixtureName === fixture.name)) {
      throw new Error(`Fixture ${fixture.name} can not depend on itself.`);
    }

    const fixtureWhichDependsCurrentFixture = fixtures.find(
      (fixtureToCheck) => {
        return (
          fixtureToCheck.name !== fixture.name &&
          fixtureToCheck
            .dependsOn()
            .some((fixtureName) => fixtureName === fixture.name)
        );
      }
    );

    if (
      fixtureWhichDependsCurrentFixture &&
      dependencies.some(
        (fixtureName) => fixtureName === fixtureWhichDependsCurrentFixture?.name
      )
    ) {
      throw new Error(
        `Infinite depedency cyrcle detected. Fixture ${fixture.name} and ${fixtureWhichDependsCurrentFixture.name} depends on each other.`
      );
    }
  }

  const sortedFixtures: Fixture[] = [];
  const visited = new Set<string>();

  const sort = (fixture: Fixture) => {
    if (!fixture.name) {
      throw new Error(`Can not sort fixtures without a valid name.`);
    }

    const dependencies = fixture.dependsOn();

    for (const dependency of dependencies) {
      const dependentFixture = fixtures.find(
        (_fixture) => _fixture.name === dependency
      );

      if (dependentFixture && !visited.has(dependentFixture?.name || '')) {
        sort(dependentFixture);
      }
    }

    if (!visited.has(fixture.name)) {
      sortedFixtures.push(fixture);
      visited.add(fixture.name);
    }
  };

  for (const fixture of fixtures) {
    sort(fixture);
  }

  return sortedFixtures;
};
