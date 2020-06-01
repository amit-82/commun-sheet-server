import { MongoClient } from 'mongodb';
import { createMongoClientWithEnv } from './utils';

export const mongoClient: MongoClient = createMongoClientWithEnv();

export const connectMongoClient = async () => mongoClient.connect();
