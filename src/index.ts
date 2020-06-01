import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

import { connectMongoClient } from './db';
import { listenToRoute } from './routes';
import { startGraphQL } from './graphql';

connectMongoClient()
	.then((client: MongoClient) => {
		console.log('mongoDB has connected successfully');
		listenToRoute();
		startGraphQL(client.db(process.env.MONGO_DB));
	})
	.catch(error => {
		console.error(error);
	});
