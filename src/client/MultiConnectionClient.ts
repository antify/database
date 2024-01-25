import mongoose, { Connection } from 'mongoose';
import { MultiConnectionDatabaseConfiguration } from '../types';
import { Client } from './Client';

export class MultiConnectionClient extends Client {
  private static instance: MultiConnectionClient;
  private configuration: MultiConnectionDatabaseConfiguration;
  private databasePrefix: string;

  private constructor(configuration: MultiConnectionDatabaseConfiguration) {
    super(configuration.databaseUrl);

    this.databasePrefix = configuration.databasePrefix || 'tenant_';
    this.configuration = configuration;
  }

  public static getInstance(
    configuration: MultiConnectionDatabaseConfiguration
  ): MultiConnectionClient {
    if (!MultiConnectionClient.instance) {
      MultiConnectionClient.instance = new MultiConnectionClient(configuration);
    }

    return MultiConnectionClient.instance;
  }

  async connect(tenantId: string) {
    const dbName = `${this.databasePrefix}${tenantId}`;

    await this.createConnection();

    this.connection = this.connection!.useDb(dbName, { useCache: true });

    return this;
  }

  async createConnection(): Promise<Connection> {
    if (this.connection) {
      return this.connection;
    }

    this.connection = await mongoose
      .createConnection(this.databaseUrl, {
        // TODO:: check this - should not stay there
        authSource: 'admin',
      })
      .asPromise();

    this.connection.on('error', (err) => {
      console.log(
        `Mongoose connection error: ${err} with connection info ${JSON.stringify(
          process.env.MONGODB_URL
        )}`
      );
      process.exit(0);
    });

    return this.connection;
  }

  getConfiguration(): MultiConnectionDatabaseConfiguration {
    return this.configuration;
  }
}
