import { Connection } from "mongoose";

export class CollectionDoesNotExistsError extends Error {
  constructor(collectionName: string, connection: Connection) {
    super(`Collection ${collectionName} does not exist in database ${connection.name}`);
  }
}
