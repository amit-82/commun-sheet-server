import { Db } from 'mongodb';
import { collections } from './types';
import { systemLog } from 'src/log';

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
	systemLog.info('MongoDB collections built');
};

export default buildCollections;
