import {join} from 'pathe';
import {DatabaseConfiguration} from '../types';

export const getAbsoluteSchemasDirs = (
	databaseConfig: DatabaseConfiguration,
	projectRootDir: string
): string[] => {
	let schemasDir = databaseConfig?.schemasDir;

	if (!schemasDir) {
		return [
			`schemas/${databaseConfig.name}`
		]
	}

	if (!Array.isArray(schemasDir)) {
		schemasDir = [schemasDir];
	}

	return schemasDir.map((dir) => join(projectRootDir, dir));
};
