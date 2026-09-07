import type {
  Client,
} from '../client/Client';
import type {
  mongo,
} from 'mongoose';

const DEFAULT_TIMEOUT_IN_MS = 60000;
const DEFAULT_POLL_INTERVAL_IN_MS = 500;

export type SearchIndexWaitOptions = {
  /**
   * Maximum time in ms to wait until the index is ready.
   * Default is 60000.
   */
  timeoutInMs?: number;

  /**
   * Time in ms between two status checks.
   * Default is 500.
   */
  pollIntervalInMs?: number;
};

export type SearchIndexOptions = {
  /**
   * Wait until the index status is "READY" and the index is queryable
   * before the migration continues.
   * Default is true.
   */
  waitForReady?: boolean;
} & SearchIndexWaitOptions;

export type SearchIndexDescription = {
  /**
   * Unique index name. Required, because update, drop and the
   * readiness check are addressed by name.
   */
  name: string;
  definition: mongo.Document;

  /**
   * "search" (default) or "vectorSearch".
   */
  type?: 'search' | 'vectorSearch';
};

export type SearchIndex = {
  name: string;

  /**
   * "BUILDING" | "READY" | "FAILED" | "DELETING"
   */
  status: string;
  queryable: boolean;
  latestDefinition?: mongo.Document;
};

export class MigrationContext {
  constructor(private client: Client) {
  }

  collection = (name: string): mongo.Collection => {
    const db = this.client.getConnection().db;

    if (!db) {
      throw new Error('Database connection is not initialized');
    }

    return db.collection(name);
  };

  renameField = async (
    collection: string,
    from: string,
    to: string,
  ): Promise<void> => {
    await this.collection(collection).updateMany(
      {
        [from]: {
          $exists: true,
        },
      },
      {
        $rename: {
          [from]: to,
        },
      },
    );
  };

  createSearchIndex = async (
    collection: string,
    description: SearchIndexDescription,
    options?: SearchIndexOptions,
  ): Promise<string> => {
    const name = await this.collection(collection).createSearchIndex(description);

    if (options?.waitForReady ?? true) {
      await this.waitForSearchIndex(collection, name, options);
    }

    return name;
  };

  createSearchIndexes = async (
    collection: string,
    descriptions: SearchIndexDescription[],
    options?: SearchIndexOptions,
  ): Promise<string[]> => {
    const names = await this.collection(collection).createSearchIndexes(descriptions);

    if (options?.waitForReady ?? true) {
      for (const name of names) {
        await this.waitForSearchIndex(collection, name, options);
      }
    }

    return names;
  };

  updateSearchIndex = async (
    collection: string,
    name: string,
    definition: mongo.Document,
    options?: SearchIndexOptions,
  ): Promise<void> => {
    await this.collection(collection).updateSearchIndex(name, definition);

    if (options?.waitForReady ?? true) {
      await this.waitForSearchIndex(collection, name, options);
    }
  };

  dropSearchIndex = async (
    collection: string,
    name: string,
  ): Promise<void> => {
    await this.collection(collection).dropSearchIndex(name);
  };

  listSearchIndexes = async (
    collection: string,
    name?: string,
  ): Promise<SearchIndex[]> => {
    const mongoCollection = this.collection(collection);
    const cursor = name === undefined
      ? mongoCollection.listSearchIndexes()
      : mongoCollection.listSearchIndexes(name);
    const indexes = await cursor.toArray();

    return indexes as unknown as SearchIndex[];
  };

  waitForSearchIndex = async (
    collection: string,
    name: string,
    options?: SearchIndexWaitOptions,
  ): Promise<void> => {
    const timeoutInMs = options?.timeoutInMs ?? DEFAULT_TIMEOUT_IN_MS;
    const pollIntervalInMs = options?.pollIntervalInMs ?? DEFAULT_POLL_INTERVAL_IN_MS;
    const deadline = Date.now() + timeoutInMs;
    let lastStatus = 'UNKNOWN';

    while (Date.now() < deadline) {
      const index = (await this.listSearchIndexes(collection, name)).at(0);

      if (index) {
        lastStatus = index.status;

        if (lastStatus === 'FAILED') {
          throw new Error(`Search index "${name}" on collection "${collection}" failed to build`);
        }

        if (lastStatus === 'READY' && index.queryable !== false) {
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalInMs));
    }

    throw new Error(`Search index "${name}" on collection "${collection}" is not ready after ${timeoutInMs}ms (last status: ${lastStatus})`);
  };
}
