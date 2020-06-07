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
			x: 1,
			y: 1,
			sheet_id: 1,
		},
		{ unique: true }
	);
	/*
	db.collection(collections.sheets).createIndex(
		{
			'cells.x': 1,
			'cells.y': 1,
			'cells.sheet_id': 1,
		},
		{ unique: true, partialFilterExpression: { 'cells.x': { $exists: true } } }
	);
*/
	console.log('MongoDB collections built');
};

export default buildCollections;
