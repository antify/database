import {
	DatabaseConfigurations,
	MultiConnectionDatabaseConfiguration
} from './types';
import {forceRequire} from './utils';
import jiti from 'jiti';

export const defineDatabaseConfig = (
	config: DatabaseConfigurations
): DatabaseConfigurations => {
	// TODO:: mai remove because its typed and should throw there already
	for (const databaseName of Object.keys(config)) {
		if (!config[databaseName].isSingleConnection) {
			if (
				(config[databaseName] as MultiConnectionDatabaseConfiguration)
					.fetchTenants === undefined
			) {
				throw new Error(
					`Configuration "${databaseName}" require "fetchTenants" is configured because it is a multi connection`
				);
			}
		}
	}

	return config;
};

export function loadDatabaseConfiguration(
	require: boolean = true,
	rootDir: string = process.cwd()
): DatabaseConfigurations {
	// TODO:: replace with unjs/c12
	const configurations: DatabaseConfigurations = require
		? forceRequire('./database.config', rootDir)
		: tryRequire('./database.config', rootDir);

	Object.keys(configurations).forEach((databaseName) => {
		configurations[databaseName].name = databaseName;
	});

	return configurations;
}

function tryRequire(id: string, rootDir: string = process.cwd()) {
	const _require = jiti(rootDir, { interopDefault: true, esmResolve: true });

	try {
		return _require(id);
	} catch (error: any) {
		if (error.code !== 'MODULE_NOT_FOUND') {
			throw error;

			// console.error(`Error trying import ${id} from ${rootDir}`, error);
		}

		return {};
	}
}
