import { usersLog } from 'src/log';
import { UserOnline, User } from 'src/data/types';
import { Context } from '../types';

export const USER_TOKEN_KEY = 'user-token';
export const GREAPHQL_TOKEN = 'graphQLToken';

const users = new Map<string, UserOnline>();
const userIds = new Set<string>();

const timeToKeepAlive = 1000 * 60;
const killZombieIntervalDuration = 1001 * 60;
const getNow = () => Date.now();

const extractToken = (context: string | Context) =>
	typeof context === 'string' ? context : validateUserToken(context);

const getUserByName = (name: string) => {
	for (let user of users.values()) {
		if (user.name === name) {
			return user;
		}
	}
	return null;
};

export const getLoggedUsersIterator = () => users.values();

export const getUserToken = (context: Context): string | null => {
	if (
		typeof context !== 'string' &&
		context.req?.header('referer') === 'http://localhost:9000/' &&
		context.req?.header('host') === 'localhost:9000'
	) {
		return GREAPHQL_TOKEN;
	}
	return context[USER_TOKEN_KEY] || context.req.header(USER_TOKEN_KEY) || null;
};

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

	usersLog.info(`LOGIN '${userOnline.name}', token: ${token}. users count: ${users.size}`);

	return userOnline;
};

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
		usersLog.info(`LOGOUT '${user.name}', token: ${user.token}. users count: ${users.size}`);
	}
};

export const reviveDisconnectedUser = (name: string, token: string) => {
	if (!token) {
		return null;
	}
	const user = getUserByName(name);
	if (!user) {
		return null;
	}
	const oldToken = user.token;
	if (!oldToken) {
		return null;
	}
	if (user) {
		if (Number.isNaN(user.disconnectTime)) {
			throw new Error('user already connected');
		}
		// revive user
		users.delete(user.token);

		user.disconnectTime = NaN;
		user.token = token;
		users.set(token, user);
		userIds.add(user._id);
		usersLog.info(`REVIVE '${user.name}', token: ${user.token}.`);

		return user;
	}
	return null;
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

// --------------------- ZOMBIES ------------------------

let killZombiesInterval: NodeJS.Timeout;

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

export const initKillZombieInterval = () => {
	if (!killZombiesInterval) {
		killZombiesInterval = setInterval(removeZombieUsers, killZombieIntervalDuration);
	}
};
