import { mongoClient } from '..';
import { collections } from '../types';
import { isEmpty } from '../../utils/input_validations';

export const getUsers = async (name: string) => {
	const nameFilter = isEmpty(name) ? {} : { name: new RegExp(name, 'i') };
	return mongoClient.db('test').collection(collections.users).find(nameFilter).toArray();
};
