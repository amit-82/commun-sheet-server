import { InsertWriteOpResult } from 'mongodb';
import { RequestHandler, Application } from 'express';

import { getMongoClient, getMongoDB } from 'src/db';
import seedAll, { seedUsers } from 'src/db/api/seed/';

import { startServer } from './server';
import { formatResponse } from './utils';

export const listenToRoute = () => {
	const server = startServer(parseInt(process.env.SERVER_PORT as string, 10));
	server.get('/', (_, res) => {
		res.send('HELLO');
	});

	setAdminRoutes(server);
};

const setAdminRoutes = (server: Application) => {
	const adminIps = (process.env.ADMIN_IPS || '').split(',');

	const restrictIP: RequestHandler = (req, res, next) => {
		const ip = req.connection.remoteAddress;
		if (adminIps.length && !adminIps.includes(ip!)) {
			res.status(401);
			res.send('not authorized');
			return;
		}
		next();
	};

	server.use(restrictIP);

	// seed
	server.get('/admin/seed/all', (_, res) => {
		seedAll(getMongoDB()).then(result => {
			res.send(formatResponse(true, result));
		});
	});
	server.get('/admin/seed/users', (req, res) => {
		const count = req.query.count ? parseInt(req.query.count as string, 10) : 10;

		seedUsers(getMongoDB(), count).then(users => {
			res.send(formatResponse(true, users));
		});
	});
};
