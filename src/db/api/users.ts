import { Db, FindOneAndUpdateOption, FindOneOptions, ObjectId } from 'mongodb';

import { UserIDless, User } from 'src/data/types';
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

const addUser = async (db: Db, name: string) => {
	const date = new Date();
	const user: UserIDless = {
		name: name.toLowerCase(),
		createdAt: date,
		loginAt: date,
		login: true,
	};
	return db
		.collection(collections.users)
		.insertOne(user)
		.then(d => d.ops[0]);
};

export const loginUser = async (db: Db, name: string) => {
	const opts: FindOneAndUpdateOption = {
		returnOriginal: false,
	};

	const existingUser: User | null = await db
		.collection<User>(collections.users)
		.findOne({ name }, {
			projection: {
				login: 1,
			},
		} as FindOneOptions);

	if (!existingUser) {
		return addUser(db, name);
	}

	if (existingUser.login) {
		throw new Error('user already logged in');
	}

	return db
		.collection(collections.users)
		.findOneAndUpdate(
			{ _id: new ObjectId(existingUser._id) },
			{
				$set: {
					login: true,
					loginAt: new Date(),
				},
			},
			opts
		)
		.then(results => {
			if (!results.ok) {
				throw new Error('failed to login to existing user');
			}
			return results.value;
		});
};
