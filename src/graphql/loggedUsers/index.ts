import { v4 as uuid } from 'uuid';

import { UserOnline, User } from 'src/data/types';
import { Context } from '../types';

let TOKEN_HEADER_KEY = 'auth-token';

const users = new Map<string, UserOnline>();
const userIds = new Set<string>();

export const validateToken = (token: string) => {
	if (!users.has(token)) {
		throw new Error('not logged');
	}
	return true;
};
export const validateLogged = (context: Context) =>
	validateToken(context.req.headers[TOKEN_HEADER_KEY]);

export const getLoggedUser = (token: string): UserOnline | undefined => users.get(token);

export const logUser = (user: User) => {
	if (userIds.has(user._id)) {
		return null;
	}

	userIds.add(user._id);

	const userOnline: UserOnline = {
		...user,
		token: uuid(),
	};
	users.set(userOnline.token, userOnline);
	return userOnline;
};
export const unlogUser = (token: string) => {
	const user = users.get(token);
	if (user) {
		userIds.delete(user._id);
		users.delete(token);
	}
};
export const getLoggedUsers = () => users.values();
