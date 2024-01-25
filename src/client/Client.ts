import { Model, Schema, Connection } from 'mongoose';

export class Client {
  protected schemas: Record<string, Schema> = {};
  protected connection: Connection | null = null;

  constructor(protected databaseUrl: string) {}

  getSchema<T>(schemaName: string): Schema {
    if (!this.schemas[schemaName]) {
      this.schemas[schemaName] = new Schema<T>();
    }

    return this.schemas[schemaName];
  }

  getModel<T>(modelName: string): Model<T> {
    if (this.connection === null) {
      throw new Error(
        'This connection is not initialized. Call "connect" first.'
      );
    }

    return this.connection.model<T>(modelName, this.schemas[modelName]);
  }

  getConnection(): Connection {
    if (this.connection === null) {
      throw new Error(
        'This connection is not initialized. Call "connect" first.'
      );
    }

    return this.connection;
  }
}
