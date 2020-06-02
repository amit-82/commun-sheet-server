import { Db } from 'mongodb';
import seedUsers from './seed_users';
import seedSheets from './seed_sheets';

const seedAll = async (db: Db) => {
	const users = await seedUsers(db);
	const sheets = await seedSheets(db);
	return {
		users,
		sheets,
	};
};

export { seedUsers, seedSheets };

export default seedAll;
