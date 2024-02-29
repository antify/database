import {describe, test, expect} from 'vitest';
import {fileURLToPath} from 'url';
import path from 'path';
import fs from 'fs';
import {loadSchemasFromFilesystem} from '../file-handler';
import {Client} from '../../client/Client';

describe('Schemas file handler test', async () => {
	function createSchemas(dirName: string) {
		const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
		const dir = path.join(__dirname, dirName);

		const fileNames = ['schema-1.ts', 'schema-2.ts', 'schema-3.ts'];

		fs.rmSync(dir, {
			recursive: true,
			force: true,
		});
		fs.mkdirSync(dir, {recursive: true});

		fileNames.forEach((fileName) => {
			fs.writeFileSync(
				path.join(dir, fileName),
				`import {defineSchema} from '../../../../../src';

export default defineSchema(async (client) => {
  return true;
});`
			);
		});
	}

	test('Should load all schemas from schemas directory', async () => {
		const schemasDirs = ['schemas/core', 'schemas/core-extensions'];

		schemasDirs.forEach(dirName => createSchemas(dirName));

		const schemas = loadSchemasFromFilesystem(__dirname, {
			databaseUrl: '',
			migrationDir: '', // TODO:: remove until migrationDir is optional
			schemasDir: schemasDirs,
		});

		expect(schemas).toHaveLength(6);

		(await Promise.all(schemas.map(cb => cb({} as Client))))
			.forEach(result => expect(result).toBe(true));
	});
});
