import {
  join,
} from 'pathe';
import {
  DatabaseConfiguration,
} from '../types';

export const getAbsoluteFixturesDirs = (
  databaseConfig: DatabaseConfiguration,
  projectRootDir: string,
): string[] => {
  let fixturesDir = databaseConfig?.fixturesDir;

  if (!fixturesDir) {
    // TODO:: does not match the description, that fixtures/CONFIGURATION_NAME is used as default
    // fixturesDir = `fixtures/${databaseConfig.name}`;
    return [];
  }

  if (!Array.isArray(fixturesDir)) {
    fixturesDir = [
      fixturesDir,
    ];
  }

  return fixturesDir.map((dir) => join(projectRootDir, dir));
};
