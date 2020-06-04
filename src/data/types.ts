import { ObjectId } from 'mongodb';

export type CellDataType = 'number' | 'string' | 'computed';
export type CellDataContent = string | number;

export interface CellData {
	type: CellDataType;
	content: CellDataContent;
}

export interface Cell {
	_id?: string;
	sheet_id: string | ObjectId;
	x: number;
	y: number;
	data?: CellData;
}

export interface Sheet {
	_id?: string;
	name: string;
	createdAt: string | Date;
}

export interface User {
	name: string;
	createdAt: string | Date;
}
