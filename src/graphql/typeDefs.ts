import { gql } from 'apollo-server';

const typeDefs = gql`
	type User {
		_id: String
		name: String
		createdAt: String
	}

	type OnlineUser {
		_id: String
		token: String
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
		users(name: String, limit: Int = 3): [User]
		onlineUsers: [User]
		sheets: [Sheet]
		getCells(sheet_id: String, startX: Int, startY: Int, endX: Int, endY: Int): [Cell]
	}

	type Mutation {
		loginUser(name: String!): OnlineUser
		addSheet(name: String!): Sheet
		setCell(sheet_id: String, x: Int, y: Int, data_type: String, data_content: String): Boolean
	}

	type Subscription {
		newUser: User!
		newSheet: Sheet!
	}
`;

export default typeDefs;
