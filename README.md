# Database

A Node.js library for managing database migrations and multi-tenant database connections. It supports creating, running,
and rolling back migrations, as well as managing models across multiple database instances.

It also is optimized for running on serverless environments like AWS Lambda or Vercel by 
reusing database connections instead of creating new ones on every function call.

TODO:
- [ ] Improve security (root user for tenants is not good)
- [ ] Implement rollback mechanism on error
- [ ] Implement migrate down
- [ ] Make migrations dir in configuration not required.
  This saves calling it manual all time.

## Usage

To use the library, first install it with \`npm install @antify/database\`. Then import the functions and initialize a database connection:

```typescript
import { getDatabaseClient } from '@antify/database';
import databaseConfig from './database.config';
import { defineUserSchema } from './schemas/user.schema';

const client = await getDatabaseClient('databaseName', databaseConfig);

// Connecting to a single connection client
await client.connect();

// Connecting to a specific tenant (multi connection client)
// await client.connect('tenantId');

// Use a model
const users = await client.getModel(defineUserSchema).find({});
```

## Settings

Set environment variable ``ANTIFY_DATABASE_DEBUG_CONNECTIONS`` to `true` to log connection events.

### Migration naming

The sorting of the migration names is important. New migrations should be added to the end (sorted ASC).
It's recommended to use a timestamp or date as name prefix.

### Migration data access

Migrations receive a schema-independent migration context instead of the regular application client.
Use raw collection operations or migration helpers so migrations can still read and transform old document fields after the
current application schema has changed.

```typescript
import { defineMigration } from '@antify/database';

export default defineMigration({
  async up(context) {
    await context.renameField('cars', 'color', 'farbe');
  },

  async down(context) {
    await context.renameField('cars', 'farbe', 'color');
  },
});
```

## Common mistakes

### Error: Schema hasn't been registered for model

As
described [here](https://stackoverflow.com/questions/26818071/mongoose-schema-hasnt-been-registered-for-model#answer-47038544),
populating related models with a simple ```.populate('relatedModel')``` will not work, because @antify/database uses
multiple connections.

Therefore, you must populate it like this:

```typescript
const client = await getDatabaseClient('core');

const user = await client.getModel('users').find({}).populate({
  path: 'address',
  model: client.getModel('addresses')
});
```

## Development

- Run `pnpm build` to generate type stubs.
- Run `node bin/ant-db.mjs` to call commands.
