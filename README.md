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
- [ ] Do not always need a schema extension for client. Do it once with a "get schema extension" hook or similar
- [ ] Find a way to handle schema options like {timestamps: true}
- [ ] Make migrations dir in configuration not required
- [ ] Allow multiple migration dirs to add them from different positions (modules)
- [ ] Add config with schema extension file path and extend all schemas before migrating, loading fixtures etc.
  This saves calling it manual all time.

## Usage

TODO::

### Migration naming

The sorting of the migration names is important. New migrations should be added to the end (sorted ASC).
Its recommended to use a timestamp or date as beginning for the name.

## Development

- Run `pnpm build` to generate type stubs.
- Run `node bin/ant-db.mjs` to call commands.
