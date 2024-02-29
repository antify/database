import {loadSchemasFromFilesystem} from './file-handler';
import {SingleConnectionClient} from '../client/SingleConnectionClient';
import {MultiConnectionClient} from '../client/MultiConnectionClient';

export const loadSchemas = async (
	client: SingleConnectionClient | MultiConnectionClient,
	projectRootDir: string
): Promise<void> => {
	const schemaCallbacks = loadSchemasFromFilesystem(
		projectRootDir,
		client.getConfiguration()
	);

	await Promise.all(schemaCallbacks.map((cb) => cb(client)));
};
