import express from 'express';

let app: express.Application;

export const getServer = () => app;

export const startServer = (port: number) => {
	if (!!app) {
		throw new Error('express server can only be started once');
	}

	app = express();
	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});

	return app;
};
