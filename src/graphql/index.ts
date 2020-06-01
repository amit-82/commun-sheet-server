import { Application } from 'express';
import { ApolloServer, gql } from 'apollo-server';
import { getUsers } from '../db/api/users';

let apolloServer: ApolloServer;

const typeDefs = gql`
	type User {
		name: String
		createdAt: String
	}

	type Query {
		users(name: String): [User]
	}
`;

const resolvers = {
	Query: {
		users: (_: any, { name }: { name: string }) => {
			return getUsers(name);
		},
	},
};

export const startGraphQL = function () {
	if (!!apolloServer) return;

	apolloServer = new ApolloServer({
		typeDefs,
		resolvers,
	});

	const port = process.env.GRAPHQL_PORT;

	return apolloServer.listen({ port }).then(info => {
		console.log(`Apollo GraphQL server running at ${info.url}`);
	});
};
