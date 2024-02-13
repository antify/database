import { Connection } from 'mongoose';
import { CollectionDoesNotExistsError } from "../errors";

export async function truncateAllCollections(connection: Connection) {
  const allCollections = await connection.db.listCollections().toArray();

  await Promise.all(
    allCollections.map(async (collection) => {
      await connection.db.dropCollection(collection.name);
    })
  );
}

export async function truncateCollections(connection: Connection, collections: string[] = []) {
  const allCollections = await connection.db.listCollections().toArray();

  collections.forEach((collection) => {
    if (!allCollections.find((c) => c.name === collection)) {
      throw new CollectionDoesNotExistsError(collection, connection);
    }
  });

  await Promise.all(
    collections.map(async (collection) => {
      await connection.db.dropCollection(collection);
    })
  );
}
