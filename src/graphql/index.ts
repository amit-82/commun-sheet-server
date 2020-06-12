import { ApolloServer, PubSub } from 'apollo-server';
import { Db } from 'mongodb';

import buildCollections from 'src/db/build_collections';
import { setCell, validateSheetExists, getCells } from 'src/db/api/cells';
import { CellDataType, User, Sheet } from 'src/data/types';
import { getAll, createSheet } from 'src/db/api/sheets';

import { getUsers, loginUser } from '../db/api/users';
import typeDefs from './typeDefs';
import { logUser, getLoggedUsers, validateLogged } from './loggedUsers';
import { namedAndLimit, named, Context } from './types';

let apolloServer: ApolloServer | null;

export const stopGraphQL = () => {
	if (apolloServer !== null) {
		apolloServer.stop();
		apolloServer = null;
	}
};

type SetCell = {
	sheet_id: string;
	x: number;
	y: number;
	data_type: CellDataType;
	data_content: string;
};

type GetCells = {
	sheet_id: string;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
};

const NEW_USER = 'new_user';
const NEW_SHEET = 'new_sheet';

export const startGraphQL = function (db: Db) {
	if (!!apolloServer) return;

	buildCollections(db);

	const resolvers = {
		Query: {
			// users
			users: (_: any, { name, limit }: namedAndLimit) => {
				return getUsers(db, name, limit);
			},

			onlineUsers: () => {
				return getLoggedUsers();
			},

			// sheets
			sheets: (_: any, __: any, context: Context) => {
				validateLogged(context);
				return getAll(db);
			},

			// cells
			getCells: (_: any, { sheet_id, startX, startY, endX, endY }: GetCells) =>
				getCells(db, sheet_id, startX, startY, endX, endY),
		},
		Mutation: {
			// users
			loginUser: (_: any, { name }: named, { pubsub }: Context) => {
				return loginUser(db, name.toLowerCase()).then((user: User) => {
					const onlineUser = logUser(user);
					pubsub.publish(NEW_USER, { newUser: user });
					return onlineUser;
				});
			},

			// sheets
			addSheet: (_: any, { name }: named, context: Context) => {
				return createSheet(db, name).then((sheet: Sheet) => {
					pubsub.publish(NEW_SHEET, { newSheet: sheet });
					return sheet;
				});
			},

			// cells
			setCell: async (_: any, { sheet_id, x, y, data_type, data_content }: SetCell) => {
				const sheetExists: any = await validateSheetExists(db, sheet_id);

				if (!sheetExists) {
					throw new Error(`unknown sheet ${sheet_id}`);
				}

				return setCell(db, sheet_id, x, y, data_type, data_content);
			},
		},

		Subscription: {
			newUser: {
				subscribe: (_: any, __: any, { pubsub }: Context) => pubsub.asyncIterator(NEW_USER),
			},
			newSheet: {
				subscribe: (_: any, __: any, { pubsub, req }: Context) => {
					console.log('newSheet sub', req.headers);
					return pubsub.asyncIterator(NEW_SHEET);
				},
			},
		},
	};

	const pubsub = new PubSub();

	apolloServer = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, res }) => {
			return { req, res, pubsub };
		},
		subscriptions: {
			onConnect(_, __, context) {
				//console.log('connect headers', context.request.headers);
			},
			onDisconnect(_, context) {
				console.log('DISconnect headers', context.request.headers);
			},
		},
	});

	const port = process.env.GRAPHQL_PORT;

	return apolloServer.listen({ port }).then(info => {
		console.log(`Apollo GraphQL server running at ${info.url}`);
	});
};
