import { Db, FindOneAndUpdateOption } from 'mongodb';

import { User } from 'src/data/types';
import { isEmpty } from 'src/utils/input_validations';
import { collections } from '../types';

export const getUsers = async (db: Db, name: string, limit: number = 10) => {
	// TODO: better name search
	const nameFilter = isEmpty(name) ? {} : { name: new RegExp(name, 'i') };
	return db
		.collection(collections.users)
		.find(nameFilter)
		.sort({ loginAt: -1 })
		.limit(limit)
		.toArray();
};

export const loginUser = async (db: Db, name: string): Promise<User> => {
	const opts: FindOneAndUpdateOption = {
		upsert: true,
		returnOriginal: false,
	};

	const now = new Date();
	const updatePipeline = {
		$set: {
			name,
			loginAt: now,
		},
		$setOnInsert: {
			createdAt: now,
		},
	};

	return db
		.collection(collections.users)
		.findOneAndUpdate({ name }, updatePipeline, opts)
		.then(result => {
			if (!result.ok) {
				throw new Error('failed to login');
			}
			return result.value;
		});
};
