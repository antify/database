import mongoose from 'mongoose';
import { SingleConnectionDatabaseConfiguration } from '../types';
import { Client } from './Client';

export class SingleConnectionClient extends Client {
  private static instance: SingleConnectionClient;
  private configuration: SingleConnectionDatabaseConfiguration;

  private constructor(configuration: SingleConnectionDatabaseConfiguration) {
    super(configuration.databaseUrl);

    this.configuration = configuration;
  }

  public static getInstance(
    configuration: SingleConnectionDatabaseConfiguration
  ): SingleConnectionClient {
    if (!SingleConnectionClient.instance) {
      SingleConnectionClient.instance = new SingleConnectionClient(
        configuration
      );
    }

    return SingleConnectionClient.instance;
  }

  async connect(): Promise<SingleConnectionClient> {
    if (!this.connection) {
      this.connection = await mongoose
        .createConnection(this.databaseUrl, {
          // TODO:: check this - should not stay there
          authSource: 'admin',
        })
        .asPromise();

      this.connection.on('error', (err) => {
        console.error(`Mongoose connection error: ${err}`);
        process.exit(0);
      });
    }

    return this;
  }

  getConfiguration(): SingleConnectionDatabaseConfiguration {
    return this.configuration;
  }
}
