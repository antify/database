import type {
  Client,
} from '../client/Client';
import type {
  mongo,
} from 'mongoose';

export class MigrationContext {
  constructor(private client: Client) {
  }

  collection = (name: string): mongo.Collection => {
    const db = this.client.getConnection().db;

    if (!db) {
      throw new Error('Database connection is not initialized');
    }

    return db.collection(name);
  };

  renameField = async (
    collection: string,
    from: string,
    to: string,
  ): Promise<void> => {
    await this.collection(collection).updateMany(
      {
        [from]: {
          $exists: true,
        },
      },
      {
        $rename: {
          [from]: to,
        },
      },
    );
  };
}
