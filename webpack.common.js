const path = require('path');

module.exports = {
	module: {
		rules: [
			{
				exclude: [path.resolve(__dirname, 'node_modules')],
				test: /\.ts$/,
				use: 'ts-loader',
			},
		],
	},

	output: {
		filename: 'server.js',
		path: path.resolve(__dirname, 'dist'),
	},

	resolve: {
		alias: {
			src: path.resolve(__dirname, 'src/'),
		},
		extensions: ['.tsx', '.ts', '.js'],
	},

	target: 'node',
};
