import {forceRequire, removeFileTypeExtension} from '../utils';
import {DatabaseConfiguration, DefineSchemaCb} from '../types';
import {getAbsoluteSchemasDirs} from './utils';
import fs from 'fs';

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
		getSchemasFilenames(absoluteSchemasDir).forEach((filename) => {
			const schema = forceRequire(
				`./${filename}`,
				absoluteSchemasDir
			) as DefineSchemaCb;

			schemaCallbacks.push(schema);
		});
	});

	return schemaCallbacks;
};

const getSchemasFilenames = (dir: string): string[] => {
	if (!fs.existsSync(dir)) {
		return [];
	}

	return fs
		.readdirSync(dir)
		.map((filename) => removeFileTypeExtension(filename))
		.sort();
};
