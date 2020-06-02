import faker from 'faker';
import { Db } from 'mongodb';

import { collections } from '../../types';
import { User } from '../../../data/types';

const seedUsers = async (db: Db, count: number = 10) => {
	await db.collection(collections.users).deleteMany({});

	const users: User[] = [];
	for (let i = 0; i < count; i++) {
		users.push({ name: faker.name.findName(), createdAt: new Date() });
	}
	return db.collection(collections.users).insertMany(users);
};

export default seedUsers;
