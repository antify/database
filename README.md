# Database

It does:

- [ ] Write docs
- [ ] Improve security (root user for tenants is not good)
- [ ] Implement rollback mechanism on error
- [ ] Implement migrate down
- [ ] Make migrations dir in configuration not required
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
