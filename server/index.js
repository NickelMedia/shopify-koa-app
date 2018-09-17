require('isomorphic-fetch');
require('dotenv').config();

const Koa = require('koa');
const route = require('koa-route');
const views = require('koa-views');
const serve = require('koa-static');
const mount = require('koa-mount');
const { default: shopifyAuth, verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const path = require('path');
const logger = require('koa-logger');
const koaWebpack = require('koa-webpack');
const ShopifyAPIClient = require('shopify-api-node');
const config = require('../config/webpack.config.dev.js');
const shopifyApiProxy = require('./koa-route-shopify-api-proxy');
const shopifyWebhookMiddleware = require('./shopify-webhook-middleware');


const {
	SHOPIFY_APP_KEY,
	SHOPIFY_APP_HOST,
	SHOPIFY_APP_SECRET,
	NODE_ENV,
} = process.env;

const shopifyConfig = {
	prefix: '/shopify',
	apiKey: SHOPIFY_APP_KEY,
	secret: SHOPIFY_APP_SECRET,
	// our app's permissions
	scopes: ['write_products', 'read_products', 'read_orders', 'write_orders'],
	// our own custom logic after authentication has completed
	afterAuth(ctx) {
		const { shop, accessToken } = ctx.session;

		registerWebhook(shop, accessToken, {
			topic: 'app/uninstalled',
			address: `${SHOPIFY_APP_HOST}/webhook`,
			format: 'json'
		});
		registerWebhook(shop, accessToken, {
			topic: 'products/create',
			address: `${SHOPIFY_APP_HOST}/webhook`,
			format: 'json'
		});
		registerWebhook(shop, accessToken, {
			topic: 'products/delete',
			address: `${SHOPIFY_APP_HOST}/webhook`,
			format: 'json'
		});
		return ctx.redirect('/');
	},
};

const registerWebhook = function (shopDomain, accessToken, webhook) {
	const shopify = new ShopifyAPIClient({ shopName: shopDomain, accessToken: accessToken });
	shopify.webhook.create(webhook).then(
		response => console.log(`webhook '${webhook.topic}' created`),
		err => console.log(`Error creating webhook '${webhook.topic}'. ${JSON.stringify(err.response.body)}`)
	);
}

const app = new Koa();
const isDevelopment = NODE_ENV !== 'production';

app.use(views(path.join(__dirname, 'views'), { extension: 'ejs' }));
app.use(logger());
app.keys = [SHOPIFY_APP_SECRET];
app.use(session(app)); // TODO: need DB store for production

app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		ctx.status = err.status || 500;
		ctx.body = err.message;
		ctx.app.emit('error', err, ctx);
	}
});

// Run webpack hot reloading in dev
if (isDevelopment) {
	koaWebpack({ config })
		.then((middleware) => {
			app.use(middleware);
		})
		.catch((err) => console.error(err.message));
} else {
	const staticPath = path.resolve(__dirname, '../assets');
	app.use(mount('/assets', serve(staticPath)));
}

// Install
app.use(route.get('/install', (ctx) => ctx.render('install')));

app.use(shopifyAuth(shopifyConfig));

const withWebhook = shopifyWebhookMiddleware({ secret: SHOPIFY_APP_SECRET });

app.use(route.post('/webhook', withWebhook((ctx, next) => {
	console.log('We got a webhook!');
	console.log('Details: ', ctx.webhook);
	console.log('Body:', ctx.body);
})));

// secure all middleware after this line
app.use(verifyRequest({ fallbackRoute: '/install' }));

//shopify api
app.use(route.all('/shopify/api/(.*)', shopifyApiProxy));

// Client
app.use(async (ctx, next) => {
	await next();
	if (ctx.status === 404) {
		return ctx.render('app', {
			title: 'Shopify Node App',
			apiKey: shopifyConfig.apiKey,
			shop: ctx.session.shop,
		});
	}
});

app.on('error', (err, ctx) => {
	console.log('error', err);
	ctx.status = err.status || 500;
	ctx.render('error', {
		message: err.message,
		error: err
	});
});

module.exports = app;
