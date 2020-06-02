type CellDataType = 'number' | 'string' | 'computed';

export interface CellData {
	type: CellDataType;
	content: string;
}

export interface Cell {
	_id?: string;
	x: string;
	y: number;
	data: CellData;
	sheetId: string;
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
