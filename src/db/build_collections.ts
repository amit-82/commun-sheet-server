import { Db } from 'mongodb';
import { collections } from './types';

const buildCollections = async (db: Db) => {
	await db.createCollection(collections.users);
	db.collection(collections.users).createIndex({ name: 'text' });

	await db.createCollection(collections.sheets);
	await db.createCollection(collections.cells);
	db.collection(collections.cells).createIndex({ x: 1, y: 1 });
};

export default buildCollections;
