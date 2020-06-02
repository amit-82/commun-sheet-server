import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config();

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
