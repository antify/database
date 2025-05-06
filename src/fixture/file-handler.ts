import {
  forceRequire, getFilenames,
} from '../utils';
import {
  DatabaseConfiguration, Fixture,
} from '../types';
import {
  getAbsoluteFixturesDirs,
} from './utils';

export const loadFixturesFromFilesystem = (
  projectRootDir: string,
  databaseConfiguration: DatabaseConfiguration,
): Fixture[] => {
  const fixtures: Fixture[] = [];
  const absoluteFixturesDirs = getAbsoluteFixturesDirs(
    databaseConfiguration,
    projectRootDir,
  );

  absoluteFixturesDirs.forEach((absoluteFixturesDir: string) => {
    getFilenames(absoluteFixturesDir).forEach((filename) => {
      const fixture = forceRequire(
        `./${filename}`,
        absoluteFixturesDir,
      ) as Fixture;

      fixture.name = filename;
      fixtures.push(fixture);
    });
  });

  return fixtures;
};
