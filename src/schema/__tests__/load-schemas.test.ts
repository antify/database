import {describe, test, expect, vi, afterEach} from 'vitest';
import {SingleConnectionClient} from '../../client/SingleConnectionClient';
import {defineSchema, SingleConnectionDatabaseConfiguration} from '../../types';
import {loadSchemas} from '../load-schemas';
import * as fileHandler from '../file-handler';

describe('Load schemas test', async () => {
	const getMocks = () => {
		const databaseConfiguration: SingleConnectionDatabaseConfiguration = {
			databaseUrl: '',
			isSingleConnection: true,
			migrationDir: '', // TODO:: Remove until migrationDir is optional
			schemasDir: ['schemas/core', 'schemas/core-extensions'],
		};
		const client = SingleConnectionClient.getInstance(databaseConfiguration);

		return {client, databaseConfiguration};
	};

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('Should load and execute all schema definitions', async () => {
		const {client} = getMocks();
		const _defineSchema = vi.fn(defineSchema(async (client) => {
		}))
		const schemaMocks = [
			_defineSchema,
			_defineSchema,
			_defineSchema,
		];
		vi.spyOn(fileHandler, 'loadSchemasFromFilesystem').mockReturnValue(schemaMocks);

		await loadSchemas(
			client,
			''
		);

		schemaMocks.forEach((schemaMock) => {
			expect(schemaMock).toHaveBeenCalledWith(client);
		});
	});
});
