import {
	LoadFixtureExecutionResult,
	Fixture,
} from '../types';
import {loadFixturesFromFilesystem} from './file-handler';
import {Client} from '../client/Client';
import {sortFixturesByDependency} from './depends-handler';
import {MultiConnectionClient} from '../client/MultiConnectionClient';
import {SingleConnectionClient} from '../client/SingleConnectionClient';

export type LoadFixtureCallbacks = {
	beforeLoadFixture?: (fixtureName: string) => void;
	onLoadFixtureFinished?: (executionResult: LoadFixtureExecutionResult) => void;
};

export const loadFixtures = async (
	client: SingleConnectionClient | MultiConnectionClient,
	projectRootDir: string,
	callbacks?: LoadFixtureCallbacks
): Promise<LoadFixtureExecutionResult[]> => {
	const results: LoadFixtureExecutionResult[] = [];
	let fixtures = loadFixturesFromFilesystem(
		projectRootDir,
		client.getConfiguration()
	);

	if (fixtures.length <= 0) {
		callbacks?.onLoadFixtureFinished?.({
			info: 'No fixtures to load',
		});

		return results;
	}

	try {
		fixtures = sortFixturesByDependency(fixtures);
	} catch (e) {
		callbacks?.onLoadFixtureFinished?.({
			error: e as Error,
		});

		return results;
	}

	for (const fixture of fixtures) {
		callbacks?.beforeLoadFixture?.(fixture.name as string);

		const result = await executeFixture(client, fixture);

		callbacks?.onLoadFixtureFinished?.(result);

		results.push(result);

		if (result.stopLoadFixtureProcess) {
			return results;
		}
	}

	return results;
};

const executeFixture = async (
	client: Client,
	fixture: Fixture
): Promise<LoadFixtureExecutionResult> => {
	const result: LoadFixtureExecutionResult = {
		fixtureName: fixture.name,
		error: null,
		executionTimeInMs: null,
	};
	const startTime = process.hrtime();

	try {
		await fixture.load(client);
	} catch (e) {
		result.stopLoadFixtureProcess = true;
		result.error = e as Error;
	}

	result.executionTimeInMs = process.hrtime(startTime)[1] / 1000000;

	return result;
};
