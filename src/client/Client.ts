import {
  Model, Schema, type Connection, InferSchemaType,
} from 'mongoose';
import {
  defineSchema, DefineSchemaCb, SchemaDefinition,
} from '../types';

export abstract class Client {
  protected schemas: Record<string, Schema> = {};
  protected connection: Connection | null = null;

  constructor(protected databaseUrl: string) {
  }

  getSchema<T>(schemaName: string): Schema {
    if (!this.schemas[schemaName]) {
      this.schemas[schemaName] = new Schema<T>();
    }

    return this.schemas[schemaName];
  }

  getModel<TSchema extends Schema>(defineSchema: DefineSchemaCb<TSchema>): Model<InferSchemaType<TSchema>> {
    if (this.connection === null) {
      throw new Error('This connection is not initialized. Call "connect" first.');
    }

    const schemaDefinition = defineSchema();

    if (this.connection.models[schemaDefinition.name]) {
      return this.connection.models[schemaDefinition.name];
    }

    return this.connection.model<InferSchemaType<TSchema>>(schemaDefinition.name, schemaDefinition.schema);
  }

  getConnection(): Connection {
    if (this.connection === null) {
      throw new Error('This connection is not initialized. Call "connect" first.');
    }

    return this.connection;
  }
}
