import { usersLog } from 'src/log';
import { UserOnline, User } from 'src/data/types';
import { Context } from '../types';

export const USER_TOKEN_KEY = 'user-token';

const users = new Map<string, UserOnline>();
const nameToTokenMap = new Map<string, string>();
const userIds = new Set<string>();

const timeToKeepAlive = 1000 * 60;
const killZombieIntervalDuration = 1001 * 60;
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

export const reviveDisconnectedUser = (name: string, token: string) => {
	if (!token) {
		return null;
	}
	const oldToken = nameToTokenMap.get(name);
	if (!oldToken) {
		return null;
	}
	const user = users.get(oldToken);
	if (user) {
		if (Number.isNaN(user.disconnectTime)) {
			throw new Error('user already connected');
		}
		// revive user
		user.disconnectTime = NaN;
		usersLog.info(`REVIVE '${user.name}', token: ${user.token}.`);
		return user;
	}
	return null;
};

export const logUser = (user: User, context: Context) => {
	const token = validateUserToken(context);

	if (userIds.has(user._id)) {
		return null;
	}

	const userOnline: UserOnline = {
		...user,
		token: getUserToken(context)!,
		disconnectTime: Number.NaN,
	};

	userIds.add(user._id);
	users.set(token, userOnline);
	nameToTokenMap.set(userOnline.name, token);

	usersLog.info(`LOGIN '${userOnline.name}', token: ${token}. users count: ${users.size}`);
	return userOnline;
};

const extractToken = (context: string | Context) =>
	typeof context === 'string' ? context : validateUserToken(context);

export const userDisconnect = (context: string | Context) => {
	const token: string | null = extractToken(context);

	const user = users.get(token);
	if (user) {
		user.disconnectTime = getNow();
		usersLog.info(
			`DISCONNCET '${user.name}', token: ${user.token}. users count: ${users.size}`
		);
	}
};

export const logoutUser = (context: string | Context) => {
	const token: string | null = extractToken(context);

	const user = users.get(token);
	if (user) {
		userIds.delete(user._id);
		users.delete(token);
		nameToTokenMap.delete(user.name);
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

export const reviveIfIsZombie = (name: string, context: string | Context) => {
	let user = getLoggedUserByName(name);
	if (user) {
		if (Number.isNaN(user.disconnectTime)) {
			throw new Error('user already logged in');
		}
		const token: string = extractToken(context);
		users.delete(user.token);
		user.token = token;
		users.set(token, user);
		usersLog.info(`REVIVE '${user.name}', token: ${user.token}. users count: ${users.size}`);
		return user;
	}
	return null;
};
/*
export const throwIfUserLoggedWithName = (name: string) => {
	let user = getLoggedUserByName(name);
	if (user) {
		throw new Error('user already logged in');
	}
};
*/
export const getLoggedUsersIterator = () => users.values();

/**
 * return number of zombie users
 */
export const removeZombieUsers = (): number => {
	const now = getNow();
	const zombieTokens = Array.from(users)
		.filter(
			([_, user]) =>
				!Number.isNaN(user.disconnectTime) && user.disconnectTime + timeToKeepAlive < now
		)
		.map(([key]) => key);

	if (zombieTokens.length > 0) {
		zombieTokens.forEach(logoutUser);
	}

	return zombieTokens.length;
};

let killZombiesInterval: NodeJS.Timeout;
export const initKillZombieInterval = () => {
	if (!killZombiesInterval) {
		killZombiesInterval = setInterval(removeZombieUsers, killZombieIntervalDuration);
	}
};
