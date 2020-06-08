import { ApolloServer, PubSub } from 'apollo-server';
import { getUsers, loginUser } from '../db/api/users';
import { Db } from 'mongodb';
import buildCollections from 'src/db/build_collections';
import { setCell, validateSheetExists, getCells } from 'src/db/api/cells';
import { CellDataType, User } from 'src/data/types';
import { getAll, createSheet } from 'src/db/api/sheets';
import typeDefs from './typeDefs';

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

type named = {
	name: string;
};

type namedAndLimit = named & {
	limit?: number;
};

type hasPubSub = {
	pubsub: PubSub;
};

const NEW_USER = 'new_user';

export const startGraphQL = function (db: Db) {
	if (!!apolloServer) return;

	buildCollections(db);

	const resolvers = {
		Query: {
			// users
			users: (_: any, { name, limit }: namedAndLimit) => getUsers(db, name, limit),
			// sheets
			sheets: (_: any) => getAll(db),

			// cells
			getCells: (_: any, { sheet_id, startX, startY, endX, endY }: GetCells) =>
				getCells(db, sheet_id, startX, startY, endX, endY),
		},
		Mutation: {
			// users
			loginUser: (_: any, { name }: named, { pubsub }: hasPubSub) => {
				return loginUser(db, name.toLowerCase()).then((user: User) => {
					pubsub.publish(NEW_USER, { newUser: user });
					return user;
				});
			},

			// sheets
			addSheet: (_: any, { name }: named) => createSheet(db, name),

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
				subscribe: (_: any, __: any, { pubsub }: hasPubSub) =>
					pubsub.asyncIterator(NEW_USER),
			},
		},
	};

	const pubsub = new PubSub();

	apolloServer = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, res }) => ({ req, res, pubsub }),
	});

	const port = process.env.GRAPHQL_PORT;

	return apolloServer.listen({ port }).then(info => {
		console.log(`Apollo GraphQL server running at ${info.url}`);
	});
};
