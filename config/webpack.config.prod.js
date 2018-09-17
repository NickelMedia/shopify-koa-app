const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const plugins = [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ];

module.exports = {
  plugins,
  target: 'web',
  devtool: 'eval',
  entry: {
    main: [
      '@shopify/polaris/styles.css',
      path.resolve(__dirname, '../client/index.js'),
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../assets'),
    publicPath: '/assets/',
    libraryTarget: 'var',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loaders: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            query: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]-[local]_[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => autoprefixer(),
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, '../node_modules/@shopify/polaris'),
        loaders: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            query: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[local]',
            },
          },
        ],
      },
    ],
  },
};
