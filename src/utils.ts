import jiti from 'jiti';
import {type Connection} from 'mongoose';

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
