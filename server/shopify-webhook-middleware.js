const crypto = require('crypto');
const getRawBody = require('raw-body');

module.exports = function configureWithWebhook({ secret, shopStore }) {
	return function createWebhookHandler(onVerified) {
		return async function withWebhook(ctx, next) {
			const hmac = ctx.request.headers['x-shopify-hmac-sha256'];
			const topic = ctx.request.headers['x-shopify-topic'];
			const shopDomain = ctx.request.headers['x-shopify-shop-domain'];

			try {
				const rawBody = await getRawBody(ctx.req);
				const generated_hash = crypto
					.createHmac('sha256', secret)
					.update(rawBody)
					.digest('base64');

				if (generated_hash !== hmac) {
					ctx.throw(401, "Unable to verify request HMAC");
					return;
				}

				const shop = await shopStore.getShop({ shop: shopDomain });
				if(!shop || !shop.accessToken ) {
					ctx.throw(401, `Unable to verify installation for ${shopDomain}`);
					return;
				}

				ctx.status = 200;
				ctx.body = rawBody.toString('utf8');
				ctx.webhook = { topic, shopDomain, accessToken };
				onVerified(ctx, next);
			} catch (error) {
				ctx.throw(500, "Unable to verify request HMAC", error);
				return;
			}
		};
	}
};