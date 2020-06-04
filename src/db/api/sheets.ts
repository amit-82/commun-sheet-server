import { Db } from 'mongodb';
import { collections } from '../types';
import { Sheet } from 'src/data/types';

export const getAll = async (db: Db) => db.collection(collections.sheets).find({}).toArray();

export const createSheet = async (db: Db, name: string) => {
	const sheet: Sheet = {
		name,
		createdAt: new Date(),
	};

	return db
		.collection(collections.sheets)
		.insertOne(sheet)
		.then(response => {
			if (!response.result.ok) {
				throw new Error(`failed to create sheet '${name}'`);
			}
			return response.ops[0];
		});
};
