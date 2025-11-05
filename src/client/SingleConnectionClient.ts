import {
  createConnection,
} from 'mongoose';
import {
  SingleConnectionDatabaseConfiguration,
} from '../types';
import {
  Client,
} from './Client';

const GLOBAL_CONNECTION_KEY = '__single_mongoose_connection__';

export class SingleConnectionClient extends Client {
  private static instance: SingleConnectionClient;
  private configuration: SingleConnectionDatabaseConfiguration;

  private constructor(configuration: SingleConnectionDatabaseConfiguration) {
    super(configuration.databaseUrl);
    this.configuration = configuration;
  }

  public static getInstance(configuration: SingleConnectionDatabaseConfiguration): SingleConnectionClient {
    if (!SingleConnectionClient.instance) {
      SingleConnectionClient.instance = new SingleConnectionClient(configuration);
    }

    return SingleConnectionClient.instance;
  }

  async connect(): Promise<SingleConnectionClient> {
    if (!(globalThis as any)[GLOBAL_CONNECTION_KEY]) {
      (globalThis as any)[GLOBAL_CONNECTION_KEY] = await createConnection(this.databaseUrl, {
        authSource: 'admin',
      }).asPromise();

      if (process.env.ANTIFY_DATABASE_DEBUG_CONNECTIONS === 'true') {
        console.info('Antify database debug: Connected to single connection');
      }
    }

    this.connection = (globalThis as any)[GLOBAL_CONNECTION_KEY];

    return this;
  }

  getConfiguration(): SingleConnectionDatabaseConfiguration {
    return this.configuration;
  }
}
