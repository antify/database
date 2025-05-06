import {
  Client,
} from './client/Client';
import type {
  Schema,
} from 'mongoose';

export type DatabaseConfiguration = {
  /**
	 * The database name coming from key. Will be
	 * automatically set.
	 */
  name?: string;

  databaseUrl: string;

  /**
	 * Directory where migration files are located.
	 * Default is `migrations/[CONFIGURATION_NAME]`
	 * // TODO:: implement default dir like fixtures does and make it not required
	 * // TODO:: allow multiple migration dirs for module development
	 */
  migrationDir: string;

  /**
	 * Directory where fixture files are located.
	 * Default is `fixtures/[CONFIGURATION_NAME]`
	 */
  fixturesDir?: string | string[];

  /**
	 * Directory where schema files are located.
	 * Default is `schemas/[CONFIGURATION_NAME]`
	 */
  schemasDir?: string | string[];
};

export type SingleConnectionDatabaseConfiguration = {
  isSingleConnection: true;
} & DatabaseConfiguration;

export type MultiConnectionDatabaseConfiguration = {
  isSingleConnection: false;
  databasePrefix?: string;

  // TODO:: In configurations should not be runtime code. Seperate it and find an other way.
  fetchTenants: () => Promise<DatabaseConfigurationTenant[]>;
} & DatabaseConfiguration;

export type DatabaseConfigurations = Record<
  string,
	SingleConnectionDatabaseConfiguration | MultiConnectionDatabaseConfiguration
>;
export type DatabaseConfigurationTenant = {
  id: string;
  name: string;
};

export type SchemaDefinition<TSchema extends Schema = any> = {
  name: string;
  schema: TSchema;
};
export type DefineSchemaCb<TSchema extends Schema = any> = () => SchemaDefinition<TSchema>;
export const defineSchema = <TSchema extends Schema>(cb: () => SchemaDefinition<TSchema>):
DefineSchemaCb<TSchema> => cb as DefineSchemaCb<TSchema>;

export type Migration = {
  name?: string;
  up: (client: Client) => Promise<void>;
  down: (client: Client) => Promise<void>;
};

export const defineMigration = (migration: Migration): Migration => migration;

export type Fixture = {
  name?: string;
  load: (client: Client) => Promise<void>;
  dependsOn: () => string[];
};

export const defineFixture = (fixture: Fixture): Fixture => fixture;

export type MigrationExecutionResult = {
  executionTimeInMs?: number | null;
  migrationName?: string | null;
  error?: Error | null;
  warning?: string | null;
  info?: string | null;
  stopMigrationProcess?: boolean;
};

export type MigrateTenantResult = {
  tenantId?: string | null;
  tenantName?: string | null;
  results?: MigrationExecutionResult[];
};

export type LoadFixtureExecutionResult = {
  executionTimeInMs?: number | null;
  fixtureName?: string | null;
  error?: Error | null;
  info?: string | null;
  stopLoadFixtureProcess?: boolean;
};

export type LoadFixtureResult = {
  tenantId?: string | null;
  tenantName?: string | null;
  results?: LoadFixtureExecutionResult[];
};

export type DropDatabaseResult = {
  tenantId?: string | null;
  tenantName?: string | null;
  result: DropDatabaseExecutionResult;
};

export type DropDatabaseExecutionResult = {
  executionTimeInMs?: number | null;
  error?: Error | null;
};
