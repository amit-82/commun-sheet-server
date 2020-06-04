import { RequestHandler, Application } from 'express';

import { getMongoDB } from 'src/db';
import seedAll, { seedUsers } from 'src/db/api/seed/';

import { startServer } from './server';
import { formatResponse } from './utils';
import { collections } from 'src/db/types';
import { Cell } from 'src/data/types';

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

	server.get('/admin/change', (_, res) => {
		const db = getMongoDB();

		const action = async () => {
			//const sheet = await db.collection(collections.sheets).findOne({});
			const cursor = await db
				.collection(collections.sheets)
				.aggregate([{ $limit: 1 }, { $project: { _id: 1 } }]);

			const sheets = await cursor.toArray();
			const sheetId: string = sheets[0]._id;

			const cell: Cell = {
				x: 1,
				y: 0,
				sheet_id: sheetId,
				data: { content: 'hello joe 5!', type: 'string' },
			};

			const result = await db.collection(collections.sheets).updateOne(
				{ _id: sheetId, 'cells.x': cell.x, 'cells.y': cell.y },
				{
					$set: {
						'cells.$.sheetId': sheetId,
						'cells.$.x': cell.x,
						'cells.$.y': cell.y,
						'cells.$.data': cell.data,
					},
				},
				{ upsert: true }
			);

			/*
			const result = await db
				.collection(collections.sheets)
				.updateOne(
					{ _id: sheetId, 'cells.x': cell.x, 'cells.y': cell.y },
					{ $addToSet: { 'cells.$.data': cell.data } }
				);
*/
			/*
			db.collection(collections.sheets)
				.updateOne(
					{ '_id': sheetId, 'cells.x': 4, 'cells.y': 5 },
					{ $addToSet: { 'cells.$.data': { type: 'number', content: 55 } } }
				)
				.then(updateResult => {
					console.log(updateResult);
					if (updateResult.result.nModified === 0) {

					}
				});
*/
			res.send({ sheets, result });
		};

		action();
	});
};
