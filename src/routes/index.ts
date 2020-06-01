import { InsertWriteOpResult } from 'mongodb';
import { RequestHandler, Application } from 'express';

import { mongoClient } from '../db';
import { seedUsers } from '../db/api/seed/';
import { startServer } from './server';
import { formatResponse } from './utils';
import { emptyArr } from 'src/utils/types';

export const listenToRoute = () => {
	const server = startServer(parseInt(process.env.SERVER_PORT as string, 10));
	server.get('/', (_, res) => {
		res.send('HELLO');
	});

	server.get('/users', (_, res) => {
		mongoClient
			.db('test')
			.collection('users')
			.find({ name: /u/i })
			.toArray()
			.then(users => {
				res.send(formatResponse(true, users));
			})
			.catch(error => {
				res.status(500);
				res.send(formatResponse(false, error));
			});
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
	server.get('/admin/seed/users', (req, res) => {
		const count = req.query.count ? parseInt(req.query.count as string, 10) : 10;

		seedUsers(mongoClient.db('test'), count).then((response: InsertWriteOpResult<any>) => {
			const { ok, n: insertCount } = response.result;
			res.send(formatResponse(ok === 1, insertCount));
		});
	});
};
