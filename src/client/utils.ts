import { Connection } from 'mongoose';

export async function truncateAllCollections(connection: Connection) {
  const collections = await connection.db.listCollections().toArray();

  await Promise.all(
    collections.map(async (collection) => {
      await connection.db.dropCollection(collection.name);
    })
  );
}
