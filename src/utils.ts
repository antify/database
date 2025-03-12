import jiti from 'jiti';
import type { Connection} from 'mongoose';
import fs from 'fs';

export function forceRequire(id: string, rootDir: string = process.cwd()) {
	const _require = jiti(rootDir, {interopDefault: true, esmResolve: true});

	return _require(id);
}

export const removeFileTypeExtension = (filename: string): string => {
	return filename.substring(0, filename.lastIndexOf('.'));
};

export const doesDatabaseExist = async (connection: Connection, databaseName: string): Promise<boolean> => {
	const databases = await connection.db.admin().listDatabases();
	const databaseNames = databases.databases.map((dbInfo) => dbInfo.name);

	return databaseNames.includes(databaseName);
};

export const getFilenames = (dir: string): string[] => {
	if (!fs.existsSync(dir)) {
		return [];
	}

	return fs
		.readdirSync(dir)
		.filter((filename) => !filename.endsWith('.d.ts'))
		.filter((filename) => filename.endsWith('.ts') || filename.endsWith('.js') || filename.endsWith('.mjs'))
		.map((filename) => removeFileTypeExtension(filename))
		.sort();
};
