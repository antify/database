import {describe, test, expect} from 'vitest';
import {getFilenames} from '../utils';
import path from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';

describe('Utils tests', async () => {
	describe('Test getFilenames function', async () => {
		function createTestFiles(absoluteDir: string, fileNames: string[]) {
			fs.rmSync(absoluteDir, {
				recursive: true,
				force: true,
			});
			fs.mkdirSync(absoluteDir, {recursive: true});

			fileNames.forEach((fileName) => {
				fs.writeFileSync(
					path.join(absoluteDir, fileName),
					'// Test content'
				);
			});
		}

		function getAbsoluteDir(dirName: string) {
			const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
			return path.join(__dirname, dirName);
		}

		test('Should handle an empty directory correctly', async () => {
			const absoluteDir = getAbsoluteDir('files')

			createTestFiles(absoluteDir, []);

			expect(getFilenames(absoluteDir)).toStrictEqual([])
		});

		test('Should only load *.ts, *.mjs, *.js file types', async () => {
			const absoluteDir = getAbsoluteDir('files')

			createTestFiles(absoluteDir, ['schema-1.ts', 'schema-2.js', 'schema-3.mjs', 'schema-4.d.ts', 'schema-5.txt', 'schema-6']);

			expect(getFilenames(absoluteDir)).toStrictEqual(['schema-1', 'schema-2', 'schema-3'])
		});
	})
});
