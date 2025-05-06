import { type Connection, createConnection } from 'mongoose';
import { MultiConnectionDatabaseConfiguration } from '../types';
import { Client } from './Client';
import {IllegalTenantError} from "../errors/IllegalTenantError";

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

	/**
	 * @param tenantId
	 * @param strict => If true, before each multi connection get connected, it validates if the tenantId exists.
	 * Be careful with this option, because it can cause a lot of database queries if the configuration.getTenants()
	 * method is not cached.
	 */
  async connect(tenantId: string, strict: boolean = false) {
		if (strict) {
			const tenants = await this.getConfiguration().fetchTenants();

			if (!tenants.some((tenant) => tenant.id === tenantId)) {
				throw new IllegalTenantError(tenantId);
			}
		}

    const dbName = `${this.databasePrefix}${tenantId}`;

    await this.createConnection();

    this.connection = this.connection!.useDb(dbName, { useCache: true });

    return this;
  }

  async createConnection(): Promise<Connection> {
    if (this.connection) {
      return this.connection;
    }

    this.connection = await createConnection(this.databaseUrl, {
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
