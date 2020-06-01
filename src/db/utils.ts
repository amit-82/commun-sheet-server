import urlencode from 'urlencode';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { emptyObj } from '../utils/types';

export const getConnectionDetailsFromEnv = () => ({
	cluster: process.env.MONGO_CLUSTER,
	user: process.env.MONGO_USER,
	password: process.env.MONGO_PASSWORD,
});

export const createConnectionString = (cluster: string, user: string, password: string) =>
	`mongodb+srv://${user}:${urlencode(
		password
	)}@${cluster}.mongodb.net/test?retryWrites=true&w=majority&useUnifiedTopology=true`;

export const createMongoClient = (cluster: string, user: string, password: string) =>
	new MongoClient(createConnectionString(cluster, user, password), { useNewUrlParser: true });

export const createEnvConnectionString = () => {
	const { cluster, user, password } = getConnectionDetailsFromEnv();

	if (!cluster || !user || !password) {
		throw new Error('env missing vars for mongoDB connection');
	}
	return createConnectionString(cluster!, user!, password!);
};

export const createMongoClientWithEnv = function (options: MongoClientOptions = emptyObj) {
	const poolSize = process.env.MONGO_POOLSIZE ? parseInt(process.env.MONGO_POOLSIZE, 10) : 5;

	return new MongoClient(createEnvConnectionString(), {
		useNewUrlParser: true,
		poolSize,
		...options,
	});
};
