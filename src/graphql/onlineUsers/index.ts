import { UserOnline, User } from 'src/data/types';
import { v4 as uuid } from 'uuid';

const users = new Map<string, UserOnline>();
const userIds = new Set<string>();

export const getOnlineUser = (token: string): UserOnline | undefined => users.get(token);
export const setOnlineUser = (user: User) => {
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
export const removeOnlineUser = (token: string) => {
	const user = users.get(token);
	if (user) {
		userIds.delete(user._id);
		users.delete(token);
	}
};
export const getOnlineUsers = () => users.values();
