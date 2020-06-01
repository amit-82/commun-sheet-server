import { Db } from 'mongodb';
import seedUsers from './seed_users';

const seedAll = (db: Db) => {
	seedUsers(db);
};

export { seedUsers };

export default seedAll;
