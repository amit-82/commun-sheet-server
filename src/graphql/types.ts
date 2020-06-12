import { PubSub } from 'apollo-server';

export type named = {
	name: string;
};

export type namedAndLimit = named & {
	limit?: number;
};

export type Context = {
	pubsub: PubSub;
	req: {
		headers: { [key: string]: string };
		header: (key: string) => string | undefined;
	};
};
