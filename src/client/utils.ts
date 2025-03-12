import { type Connection } from 'mongoose';

export async function truncateAllCollections(connection: Connection) {
  const allCollections = await connection.db.listCollections().toArray();

  await Promise.all(
    allCollections.map(async (collection) => {
      await connection.db.dropCollection(collection.name);
    })
  );
}

export async function truncateCollections(connection: Connection, collections: string[] = []) {
  await Promise.all(
    collections.map(async (collection) => {
      await connection.db.dropCollection(collection);
    })
  );
}
