import { PubSub } from 'apollo-server';
import { USER_TOKEN_KEY } from './loggedUsers';

export type named = {
	name: string;
};

export type namedAndLimit = named & {
	limit?: number;
};

export type Context = {
	[USER_TOKEN_KEY]: string;
	pubsub: PubSub;
	req: {
		headers: { [key: string]: string };
		header: (key: string) => string | undefined;
		socket: {
			Socket: any;
			UID?: string;
		};
	};
};
