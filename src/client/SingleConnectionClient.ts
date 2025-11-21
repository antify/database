import {
  createConnection,
} from 'mongoose';
import {
  SingleConnectionDatabaseConfiguration,
} from '../types';
import {
  Client,
} from './Client';
import { attachDatabasePool} from '@vercel/functions';

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
      (globalThis as any)[GLOBAL_CONNECTION_KEY] = createConnection(this.databaseUrl, {
        authSource: 'admin',
        maxPoolSize: 1,
        minPoolSize: 1,
      });

      attachDatabasePool((globalThis as any)[GLOBAL_CONNECTION_KEY]);

      if (process.env.ANTIFY_DATABASE_DEBUG_CONNECTIONS === 'true') {
        console.info('Antify database debug: Created connection to single connection');
      }
    }

    this.connection = await (globalThis as any)[GLOBAL_CONNECTION_KEY].asPromise();

    if (process.env.ANTIFY_DATABASE_DEBUG_CONNECTIONS === 'true') {
      console.info('Antify database debug: Connected to single connection');
    }

    return this;
  }

  getConfiguration(): SingleConnectionDatabaseConfiguration {
    return this.configuration;
  }
}
