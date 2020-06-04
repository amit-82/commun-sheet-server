import { Db, ObjectId, UpdateWriteOpResult } from 'mongodb';

import { CellData, CellDataType, CellDataContent } from 'src/data/types';
import { collections } from '../types';

export const validateSheetExists = async (db: Db, sheet_id: string) => {
	return db
		.collection(collections.sheets)
		.findOne({ _id: new ObjectId(sheet_id) })
		.then(result => !!result);
};

export const setCell = async (
	db: Db,
	sheet_id: string,
	x: number,
	y: number,
	data_type: CellDataType,
	data_content: CellDataContent
) => {
	const data: CellData = {
		type: data_type,
		content: data_content,
	};

	const sheetID = new ObjectId(sheet_id);

	return db
		.collection(collections.cells)
		.updateOne(
			{ sheet_id: sheetID, x: x, y: y },
			{
				$set: {
					sheet_id: sheetID,
					x: x,
					y: y,
					data: data,
				},
			},
			{ upsert: true }
		)
		.then((result: UpdateWriteOpResult) => {
			return result.result.ok;
		});
};

export const getCells = async (
	db: Db,
	sheet_id: string,
	startX: number,
	startY: number,
	endX: number,
	endY: number
) => {
	return db
		.collection(collections.cells)
		.find({
			sheet_id: new ObjectId(sheet_id),
			x: { $gte: startX, $lte: endX },
			y: { $gte: startY, $lte: endY },
		})
		.toArray();
};
