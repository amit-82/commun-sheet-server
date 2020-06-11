import { Db } from 'mongodb';
import { collections } from './types';

const buildCollections = async (db: Db) => {
	await db.createCollection(collections.users);
	db.collection(collections.users).createIndex({ name: 1 }, { unique: true });

	await db.createCollection(collections.sheets);
	await db.collection(collections.sheets).createIndex({ name: 1 }, { unique: true });

	await db.createCollection(collections.cells);
	await db.collection(collections.cells).createIndex(
		{
			sheet_id: 1,
			x: 1,
			y: 1,
		},
		{ unique: true }
	);
	console.log('MongoDB collections built');
};

export default buildCollections;
