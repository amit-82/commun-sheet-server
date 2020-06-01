import dotenv from 'dotenv';
dotenv.config();

import { connectMongoClient } from './db';
import { listenToRoute } from './routes';
import { startGraphQL } from './graphql';

connectMongoClient()
	.then(() => {
		console.log('mongoDB has connected successfully');
		listenToRoute();
		startGraphQL();
	})
	.catch(error => {
		console.error(error);
	});
