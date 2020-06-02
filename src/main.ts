import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config();

import { connectMongoClient } from './db';
import { listenToRoute } from './routes';
import { startGraphQL } from './graphql';
import { closeServer } from './routes/server';

connectMongoClient()
	.then((client: MongoClient) => {
		console.log('mongoDB has connected successfully!');
		listenToRoute();
		startGraphQL(client.db(process.env.MONGO_DB));
	})
	.catch(error => {
		console.error(error);
	});

if (module.hot) {
	closeServer();
	module.hot.accept();
	module.hot.dispose(() => console.log('Module disposed. '));
}
