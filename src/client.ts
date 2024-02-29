import {SingleConnectionClient} from './client/SingleConnectionClient';
import {MultiConnectionClient} from './client/MultiConnectionClient';
import {loadDatabaseConfiguration} from './config';
import {loadSchemas} from './schema/load-schemas';

export async function getDatabaseClient(
	contextId: string,
	rootDir: string = process.cwd()
): Promise<SingleConnectionClient | MultiConnectionClient> {
	const configuration = loadDatabaseConfiguration(true, rootDir)[contextId];

	if (!configuration) {
		throw new Error(`Configuration with name ${contextId} does not exists`);
	}

	const client = configuration.isSingleConnection
		? SingleConnectionClient.getInstance(configuration)
		: MultiConnectionClient.getInstance(configuration);

	await loadSchemas(client, rootDir);

	return client;
}
