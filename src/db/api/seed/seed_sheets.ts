import { Db } from 'mongodb';
import { Sheet, Cell } from 'src/data/types';
import { collections } from 'src/db/types';

const seed = async (db: Db) => {
	db.collection(collections.sheets).deleteMany({});
	db.collection(collections.cells).deleteMany({});

	const sheetName1 = 'test-sheet-1';
	//const sheetName2 = 'test-sheet-2';

	const sheets: Sheet[] = [
		{ name: sheetName1, createdAt: new Date() },
		//{ name: sheetName2, createdAt: new Date() },
	];

	const response = await db.collection(collections.sheets).insertMany(sheets);
	if (!response.result.ok) {
		throw new Error('failed to seed sheets');
	}
	const newSheets: Sheet[] = response.ops;

	await addCellsToSheet(db, newSheets[0]);
	//await addCellsToSheet(db, newSheets[1]);

	return newSheets;
};

const addCellsToSheet = async (db: Db, { _id }: Sheet) => {
	const cells: Cell[] = [
		{ x: 0, y: 0, sheet_id: _id! },
		{ x: 0, y: 1, sheet_id: _id! },
	];

	await db.collection(collections.cells).insertMany(cells);
};

export default seed;
