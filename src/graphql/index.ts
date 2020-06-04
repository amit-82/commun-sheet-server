import { ApolloServer, gql } from 'apollo-server';
import { getUsers, addUser } from '../db/api/users';
import { Db, ObjectId } from 'mongodb';
import buildCollections from 'src/db/build_collections';
import { setCell, validateSheetExists, getCells } from 'src/db/api/cells';
import { CellDataType, User } from 'src/data/types';
import { getAll, createSheet } from 'src/db/api/sheets';

let apolloServer: ApolloServer | null;

const typeDefs = gql`
	type User {
		_id: String
		name: String
		createdAt: String
	}

	type Sheet {
		_id: String
		name: String
		createdAt: String
	}

	type Cell {
		_id: String
		x: Int
		y: Int
	}

	type Query {
		users(name: String): [User]
		sheets: [Sheet]
		getCells(sheet_id: String, startX: Int, startY: Int, endX: Int, endY: Int): [Cell]
	}

	type Mutation {
		addUser(name: String): User
		addSheet(name: String): Sheet
		setCell(sheet_id: String, x: Int, y: Int, data_type: String, data_content: String): Boolean
	}
`;

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

export const startGraphQL = function (db: Db) {
	if (!!apolloServer) return;

	buildCollections(db);

	const resolvers = {
		Query: {
			// users
			users: (_: any, { name }: named) => getUsers(db, name),
			// sheets
			sheets: (_: any) => getAll(db),

			// cells
			getCells: (_: any, { sheet_id, startX, startY, endX, endY }: GetCells) =>
				getCells(db, sheet_id, startX, startY, endX, endY),
		},
		Mutation: {
			// users
			addUser: (_: any, { name }: named) => addUser(db, name),

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
	};

	apolloServer = new ApolloServer({
		typeDefs,
		resolvers,
	});

	const port = process.env.GRAPHQL_PORT;

	return apolloServer.listen({ port }).then(info => {
		console.log(`Apollo GraphQL server running at ${info.url}`);
	});
};
