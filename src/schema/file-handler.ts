import {forceRequire, getFilenames} from '../utils';
import {DatabaseConfiguration, DefineSchemaCb} from '../types';
import {getAbsoluteSchemasDirs} from './utils';

export const loadSchemasFromFilesystem = (
	projectRootDir: string,
	databaseConfiguration: DatabaseConfiguration
): DefineSchemaCb[] => {
	const schemaCallbacks: DefineSchemaCb[] = [];
	const absoluteSchemasDirs = getAbsoluteSchemasDirs(
		databaseConfiguration,
		projectRootDir
	);

	absoluteSchemasDirs.forEach((absoluteSchemasDir: string) => {
		getFilenames(absoluteSchemasDir).forEach((filename) => {
			const schema = forceRequire(
				`./${filename}`,
				absoluteSchemasDir
			) as DefineSchemaCb;

			schemaCallbacks.push(schema);
		});
	});

	return schemaCallbacks;
};
