import { Application } from 'express';
import { ApolloServer, gql } from 'apollo-server';
import { getUsers, addUser } from '../db/api/users';
import { Db } from 'mongodb';

let apolloServer: ApolloServer;

const typeDefs = gql`
	type User {
		name: String
		createdAt: String
	}

	type Query {
		users(name: String): [User]
	}

	type Mutation {
		addUser(name: String): User
	}
`;

export const startGraphQL = function (db: Db) {
	if (!!apolloServer) return;

	const resolvers = {
		Query: {
			users: (_: any, { name }: { name: string }) => getUsers(db, name),
		},
		Mutation: {
			addUser: (_: any, { name }: { name: string }) => addUser(db, name),
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
