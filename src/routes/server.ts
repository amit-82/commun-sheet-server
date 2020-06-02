import http from 'http';
import express from 'express';

let app: express.Application | null;
let server: http.Server | null;

export const getServer = () => app;

export const startServer = (port: number) => {
	if (!!app) {
		throw new Error('express server can only be started once');
	}

	app = express();
	server = app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});

	return app;
};

export const closeServer = () => {
	if (!!app) {
		server?.close();
		app = server = null;
	}
};
