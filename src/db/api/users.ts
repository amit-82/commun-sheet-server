import { collections } from '../types';
import { isEmpty } from '../../utils/input_validations';
import { User } from 'src/data/types';
import { Db } from 'mongodb';

export const getUsers = async (db: Db, name: string) => {
	const nameFilter = isEmpty(name) ? {} : { name: new RegExp(name, 'i') };
	return db.collection(collections.users).find(nameFilter).toArray();
};

export const addUser = async (db: Db, name: string) => {
	const user: User = { name, createdAt: new Date() };
	return db
		.collection(collections.users)
		.insertOne(user)
		.then(d => d.ops[0]);
};
