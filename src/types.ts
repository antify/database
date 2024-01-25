import {Client} from './client/Client';

export type DatabaseConfiguration = {
    /**
     * The database name coming from key. Will be
     * automatically set.
     */
    name?: string;

    databaseUrl: string;

    /**
     * Directory where migration files are expected.
     * Default is `migrations/[CONFIGURATION_NAME]`
     * // TODO:: implement default dir like fixtures does and make it not required
     */
    migrationDir: string;

    /**
     * Directory where fixture files are expected.
     * Default is `fixtures/[CONFIGURATION_NAME]`
     */
    fixturesDir?: string | string[];
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
export type DatabaseConfigurationTenant = { id: string; name: string };

// TODO:: Move, its no type anymore
export const defineDatabaseConfig = (
    config: DatabaseConfigurations
): DatabaseConfigurations => {
    // TODO:: mai remove because its typed and should throw there already
    for (const databaseName of Object.keys(config)) {
        if (!config[databaseName].isSingleConnection) {
            if (
                (config[databaseName] as MultiConnectionDatabaseConfiguration)
                    .fetchTenants === undefined
            ) {
                throw new Error(
                    `Configuration "${databaseName}" require "fetchTenants" is configured because it is a multi connection`
                );
            }
        }
    }

    return config;
};

export type Migration = {
    name?: string;
    up: (client: Client) => Promise<void>;
    down: (client: Client) => Promise<void>;
};

export const defineMigration = (migration: Migration): Migration => {
    return migration;
};

export type Fixture = {
    name?: string;
    load: (client: Client) => Promise<void>;
    dependsOn: () => string[];
};

export const defineFixture = (fixture: Fixture): Fixture => {
    return fixture;
};

export interface MigrationSchema {
    file: string;
    date: Date;
}

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
