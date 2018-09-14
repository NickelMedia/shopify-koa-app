const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		main: [
			'@shopify/polaris/styles.css',
			path.resolve(__dirname, '../client/index.js'),
		],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader' ],
			},
		],
	},
	resolve: {
		extensions: ['*', '.js', '.jsx'],
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, '../assets'),
		publicPath: '/assets/',
	},
};
