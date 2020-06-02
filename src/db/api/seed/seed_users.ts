import faker from 'faker';
import { Db } from 'mongodb';

import { collections } from 'src/db/types';
import { User } from 'src/data/types';

const seedUsers = async (db: Db, count: number = 10) => {
	await db.collection(collections.users).deleteMany({});

	const users: User[] = [];
	for (let i = 0; i < count; i++) {
		users.push({ name: faker.name.findName(), createdAt: new Date() });
	}
	const result = await db.collection(collections.users).insertMany(users);

	if (result.result.ok === 0) {
		throw new Error('failed to seed users');
	}

	return result.ops;
};

export default seedUsers;
