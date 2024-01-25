import {describe, test, expect} from 'vitest';
import {fileURLToPath} from 'url';
import path from 'path';
import fs from 'fs';
import {loadFixturesFromFilesystem} from '../file-handler';

describe('Fixtures file handler test', async () => {
    function createFixtures(dirName: string) {
        const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
        const dir = path.join(__dirname, dirName);

        const fileNames = ['fixture-1.ts', 'fixture-2.ts', 'fixture-3.ts'];

        fs.rmSync(dir, {
            recursive: true,
            force: true,
        });
        fs.mkdirSync(dir, {recursive: true});

        fileNames.forEach((fileName) => {
            fs.writeFileSync(
                path.join(dir, fileName),
                `import { defineFixture } from '../../../../../src';

export default defineFixture({
  async load(client) { },
});`
            );
        });
    }

    test('Should load all fixtures from fixtures directory', async () => {
        const fixturesDirs = ['fixtures/core', 'fixtures/core-extensions'];

        fixturesDirs.forEach(dirName => createFixtures(dirName))

        const fixtures = loadFixturesFromFilesystem(__dirname, {
            databaseUrl: '',
            migrationDir: '', // TODO:: remove until migrationDir is optional
            fixturesDir: fixturesDirs,
        });

        expect(fixtures).toHaveLength(6);

        fixtures.forEach(async (fixture, index) => {
            expect(fixture).toHaveProperty('name');
            expect(fixture).toHaveProperty('load');
            expect(fixture.name).toMatch(/fixture-\d/);
        });
    });
});
