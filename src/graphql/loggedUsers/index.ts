import { usersLog } from 'src/log';
import { UserOnline, User } from 'src/data/types';
import { Context } from '../types';

export const USER_TOKEN_KEY = 'user-token';

const users = new Map<string, UserOnline>();
const userIds = new Set<string>();

const timeToKeepAlive = 5000; //1000 * 60 * 5;
const killZombieIntervalDuration = 1000; //1000 * 60;
const getNow = () => Date.now();

export const getUserToken = (context: Context): string | null =>
	context[USER_TOKEN_KEY] || context.req.header(USER_TOKEN_KEY) || null;

export const validateUserToken = (context: Context): string => {
	const token = getUserToken(context);
	if (token === null) {
		throw new Error('missing user token');
	}
	return token;
};

export const validateUserLogged = (context: Context) => {
	const token = validateUserToken(context);
	const user = getLoggedUser(token);
	if (!user) {
		throw 'not logged';
	}
	return user;
};

export const getLoggedUser = (token: string): UserOnline | undefined => users.get(token);

export const logUser = (user: User, context: Context) => {
	validateUserToken(context);

	if (userIds.has(user._id)) {
		return null;
	}

	const userOnline: UserOnline = {
		...user,
		token: getUserToken(context)!,
		pingTime: getNow(),
	};

	userIds.add(user._id);
	users.set(userOnline.token, userOnline);

	usersLog.info(
		`LOGIN '${userOnline.name}', token: ${userOnline.token}. users count: ${users.size}`
	);
	return userOnline;
};

export const logoutUser = (context: string | Context) => {
	const token: string | null = typeof context === 'string' ? context : validateUserToken(context);

	const user = users.get(token);
	if (user) {
		userIds.delete(user._id);
		users.delete(token);
		usersLog.info(`LOGOUT '${user.name}', token: ${user.token}. users count: ${users.size}`);
	}
};

export const getLoggedUserByName = (name: string) => {
	const usersIterator = users.values();
	let user = usersIterator.next();
	while (!user.done) {
		if (user.value.name === name) {
			return user.value;
		}
		user = usersIterator.next();
	}
	return null;
};

export const throwIfUserLoggedWithName = (name: string) => {
	let user = getLoggedUserByName(name);
	if (user) {
		throw new Error('user already logged in');
	}
};

export const getLoggedUsersIterator = () => users.values();

// zombies

export const ping = (token: string) => {
	const user = users.get(token);
	if (user) {
		users.get(token)!.pingTime = getNow();
	}
};

// TODO: remove all zombie BS (?)
/**
 * return number of zombie users
 */
export const removeZombieUsers = (): number => {
	const now = getNow();
	const zombieTokens = Array.from(users)
		.filter(([_, user]) => user.pingTime + timeToKeepAlive < now)
		.map(([key]) => key);

	zombieTokens.forEach(logoutUser);

	console.log('killing zombies...', zombieTokens.length);

	return zombieTokens.length;
};

let killZombiesInterval: NodeJS.Timeout;
export const initKillZombieInterval = () => {
	return;
	if (!killZombiesInterval) {
		killZombiesInterval = setInterval(removeZombieUsers, killZombieIntervalDuration);
	}
};
