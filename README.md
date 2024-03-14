# Database

It does:

- [x] Merges multiple schemas to one
- [x] Provide a client for each database
- [x] Make fixtures logic
- [x] Make seed logic
- [x] Make migration logic
- [x] Handle multiple migrations from different sources
- [x] Comes with a set of cli commands
- [x] Provides a core and tenant client
- [x] Handle multiple databases for one schema (tenancy)
- [x] Define how things can be extended trought different schemas
- [ ] Write docs
- [ ] Improve security (root user for tenants is not good)
- [ ] Implement rollback mechanism on error
- [x] Implement stop mechanism on error
- [ ] Implement migrate down
- [x] Do not always need a schema extension for client. Do it once with a "get schema extension" hook or similar
- [ ] Find a way to handle schema options like {timestamps: true}
- [ ] Make migrations dir in configuration not required
- [x] Allow multiple migration dirs to add them from different positions (modules)
- [x] Add config with schema extension file path and extend all schemas before migrating, loading fixtures etc.
	This saves calling it manual all time.

## Usage

TODO::

### Migration naming

The sorting of the migration names is important. New migrations should be added to the end (sorted ASC).
It's recommended to use a timestamp or date as name prefix.

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
