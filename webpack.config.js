const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: path.resolve(__dirname, 'src/index.ts'),
	target: 'node',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		modules: [path.join(__dirname, './src'), 'node_modules'],
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		libraryTarget: 'commonjs',
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
	},
	plugins: [
		new RemovePlugin({
			before: {
				include: ['./dist'],
			},
			watch: {
				//include: ['./dist'],
			},
		}),
		new CopyPlugin({
			patterns: [{ from: '.env', to: path.resolve(__dirname, 'dist') }],
		}),
	],
};
