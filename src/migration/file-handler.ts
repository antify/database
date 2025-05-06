import {
  DatabaseConfiguration, Migration,
} from '../types';
import {
  forceRequire, getFilenames,
} from '../utils';
import {
  getAbsoluteMigrationDir,
} from './utils';

export const loadMigrationsFromFilesystem = (
  projectRootDir: string,
  databaseConfiguration: DatabaseConfiguration,
): Migration[] => {
  const migrations: Migration[] = [];
  const absoluteMigrationDir = getAbsoluteMigrationDir(
    databaseConfiguration,
    projectRootDir,
  );

  getFilenames(absoluteMigrationDir).forEach((filename) => {
    const migration = forceRequire(
      `./${filename}`,
      absoluteMigrationDir,
    ) as Migration;

    migration.name = filename;
    migrations.push(migration);
  });

  return migrations;
};
