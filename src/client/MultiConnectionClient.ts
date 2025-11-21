import {
  createConnection,
} from 'mongoose';
import {
  MultiConnectionDatabaseConfiguration,
} from '../types';
import {
  Client,
} from './Client';
import {
  IllegalTenantError,
} from '../errors/IllegalTenantError';

const GLOBAL_CONNECTION_PREFIX = '__multi_mongoose_connection_';

export class MultiConnectionClient extends Client {
  private static instance: MultiConnectionClient;
  private configuration: MultiConnectionDatabaseConfiguration;
  private databasePrefix: string;

  private constructor(configuration: MultiConnectionDatabaseConfiguration) {
    super(configuration.databaseUrl);
    this.databasePrefix = configuration.databasePrefix || 'tenant_';
    this.configuration = configuration;
  }

  public static getInstance(configuration: MultiConnectionDatabaseConfiguration): MultiConnectionClient {
    if (!MultiConnectionClient.instance) {
      MultiConnectionClient.instance = new MultiConnectionClient(configuration);
    }

    return MultiConnectionClient.instance;
  }

  async connect(tenantId: string, strict: boolean = false) {
    if (strict) {
      const tenants = await this.getConfiguration().fetchTenants();

      if (!tenants.some((tenant) => tenant.id === tenantId)) {
        throw new IllegalTenantError(tenantId);
      }
    }

    const globalKey = `${GLOBAL_CONNECTION_PREFIX}${tenantId}`;

    if (!(globalThis as any)[globalKey]) {
      const baseConnection = await createConnection(this.databaseUrl, {
        authSource: 'admin',
        maxPoolSize: 1,
        minPoolSize: 1,
      }).asPromise();

      (globalThis as any)[globalKey] = baseConnection.useDb(`${this.databasePrefix}${tenantId}`, {
        useCache: true,
      });

      if (process.env.ANTIFY_DATABASE_DEBUG_CONNECTIONS === 'true') {
        console.log(`Antify database debug: Connected to multi connection for tenant ${tenantId}`);
      }
    }

    this.connection = (globalThis as any)[globalKey];

    return this;
  }

  getConfiguration(): MultiConnectionDatabaseConfiguration {
    return this.configuration;
  }
}
