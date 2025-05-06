import {Client} from '../../client/Client';
import {Schema} from 'mongoose';

export const createDatabaseWithDummyRecord = async (connectedClient: Client) => {
	await connectedClient.getModel(() => ({
		name: 'dummy',
		schema: new Schema({
			title: {
				type: String,
				required: true,
			},
		}),
	}))
		.insertMany([{title: 'dummy'}]);
}
