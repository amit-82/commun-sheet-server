import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config();

import { connectMongoClient } from './db';
import { listenToRoute } from './routes';
import { startGraphQL, stopGraphQL } from './graphql';
import { closeServer } from './routes/server';

connectMongoClient()
	.then((client: MongoClient) => {
		console.log('mongoDB has connected successfully!');
		startGraphQL(client.db(process.env.MONGO_DB));
		listenToRoute();
	})
	.catch(error => {
		console.error(error);
	});

if (module.hot) {
	module.hot.accept();
	module.hot.dispose(() => {
		closeServer();
		stopGraphQL();
	});
}
