import { Client } from '../../client/Client';

export const createDatabaseWithDummyRecord = async (connectedClient: Client) => {
    connectedClient.getSchema('dummy').add({
        title: {
            type: String
        }
    });

    await connectedClient.getModel('dummy').insertMany([{ title: 'dummy' }]);
}