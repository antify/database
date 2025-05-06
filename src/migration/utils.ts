import {DatabaseConfiguration, DefineSchemaCb} from '../types';
import {join} from 'pathe';
import {Client} from '../client/Client';
import {Schema} from 'mongoose';

export const getMigrationDocuments = async (client: Client) => {
	return client.getModel(defineMigrationSchema).find({}).sort('file');
};

export const defineMigrationSchema: DefineSchemaCb<any> = () => {
	return {
		name: 'migrations',
		schema: new Schema({
			file: {
				type: String,
				required: true,
				unique: true,
			},
			executedOn: {
				type: Date,
				required: false,
			},
		})
	}
};

export const getAbsoluteMigrationDir = (
	databaseConfig: DatabaseConfiguration,
	projectRootDir: string
) => {
	return join(projectRootDir, databaseConfig.migrationDir);
};
