import { DropDatabaseExecutionResult } from '../types';
import { Client } from '../client/Client';

/**
 * Drop the clients connected database.
 */
export const dropDatabase = async (client: Client): Promise<DropDatabaseExecutionResult> => {
  const result: DropDatabaseExecutionResult = {
    error: null,
    executionTimeInMs: null,
  };
  const startTime = process.hrtime();

  try {
    await client.getConnection().dropDatabase();
  } catch (e) {
    result.error = e as Error;
  }

  result.executionTimeInMs = process.hrtime(startTime)[1] / 1000000;

  return result;
};