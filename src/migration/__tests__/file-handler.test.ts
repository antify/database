import { loadMigrationsFromFilesystem } from '../file-handler';
import { describe, test, expect } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

describe('Migration file handler test', async () => {
  test('Should load all migrations from migrations directory', async () => {
    const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
    const folderName = 'migrations/core';
    const dir = path.join(__dirname, folderName);
    const fileNames = ['migration-1.ts', 'migration-2.ts', 'migration-3.ts'];

    fs.rmSync(dir, {
      recursive: true,
      force: true,
    });
    fs.mkdirSync(dir, { recursive: true });

    fileNames.forEach((fileName) => {
      fs.writeFileSync(
        path.join(dir, fileName),
        `import { defineMigration } from '../../../../../src';

export default defineMigration({
  async up(client) { },

  async down(client) { },
});`
      );
    });

    const migrations = loadMigrationsFromFilesystem(__dirname, {
      databaseUrl: '',
      migrationDir: folderName,
    });

    expect(migrations).toHaveLength(3);

    migrations.forEach(async (migration, index) => {
      expect(migration).toHaveProperty('name');
      expect(migration).toHaveProperty('up');
      expect(migration).toHaveProperty('down');
      expect(migration.name).toBe(`migration-${index + 1}`);
    });
  });
});
