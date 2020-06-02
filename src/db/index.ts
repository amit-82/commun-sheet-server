import { MongoClient } from 'mongodb';
import { createMongoClientWithEnv } from './utils';

const mongoClient: MongoClient = createMongoClientWithEnv();

export const getMongoClient = () => mongoClient;
export const getMongoDB = () => mongoClient.db(process.env.MONGO_DB);

export const connectMongoClient = async () => mongoClient.connect();
