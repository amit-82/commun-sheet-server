type CellDataType = 'number' | 'string' | 'computed';

export interface CellData {
	type: CellDataType;
	content: string;
}

export interface Cell {
	uid: string;
	x: string;
	y: number;
	data: CellData;
	sheetId: string;
}

export interface Sheet {
	uid: string;
	name: string;
	createdAt: string;
}

export interface User {
	name: string;
	createdAt: string | Date;
}
