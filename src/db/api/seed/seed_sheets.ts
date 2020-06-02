import { Db } from 'mongodb';
import { Sheet } from 'src/data/types';
import { collections } from 'src/db/types';

const seed = async (db: Db) => {
	db.collection(collections.cells).deleteMany({});
	db.collection(collections.sheets).deleteMany({});

	const s1 = 'test-sheet-1';
	const s2 = 'test-sheet-2';

	const sheets: Sheet[] = [
		{ name: 'test-sheet-1', createdAt: new Date() },
		{ name: 'test-sheet-2', createdAt: new Date() },
	];

	const response = await db.collection(collections.sheets).insertMany(sheets);
	if (!response.result.ok) {
		throw new Error('failed to seed sheets');
	}
	const newSheets: Sheet[] = response.ops;
	return newSheets;
};

export default seed;
