import dotenv from 'dotenv';
dotenv.config();

import { connectMongoClient } from './db';
import { listenToRoute } from './routes';

connectMongoClient()
	.then(() => {
		console.log('mongoDB has connected successfully 2');
		listenToRoute();
	})
	.catch(error => {
		console.error(error);
	});
