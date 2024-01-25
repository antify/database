import { DatabaseConfiguration, Migration } from '../types';
import { forceRequire, removeFileTypeExtension } from '../utils';
import { getAbsoluteMigrationDir } from './utils';
import fs from 'fs';

export const loadMigrationsFromFilesystem = (
  projectRootDir: string,
  databaseConfiguration: DatabaseConfiguration
): Migration[] => {
  const migrations: Migration[] = [];
  const absoluteMigrationDir = getAbsoluteMigrationDir(
    databaseConfiguration,
    projectRootDir
  );

  getMigrationsFilenames(absoluteMigrationDir).forEach((filename) => {
    const migration = forceRequire(
      `./${filename}`,
      absoluteMigrationDir
    ) as Migration;

    migration.name = filename;
    migrations.push(migration);
  });

  return migrations;
};

export const getMigrationsFilenames = (dir: string): string[] => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .map((filename) => removeFileTypeExtension(filename))
    .sort();
};
