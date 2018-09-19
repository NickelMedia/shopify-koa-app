const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.set('createIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);

const schema = require('./schema');

module.exports = class MongooseStore {
	constructor({
		collection = 'shops',
		connection = mongoose,
		name = 'Shop'
	} = {}) {
		const { Schema } = connection;
		this.shops = connection.model(name, new Schema({ ...schema }), collection);
	}

	async storeShop({ shop, accessToken }) {
		console.log('hey', shop, accessToken);
		const { shops } = this;
		const record = { _id: shop, accessToken };
		await shops.findByIdAndUpdate(shop, record, { upsert: true, safe: true });
		return record;
	}

	async getShop({ shop }) {
		const { shops } = this;
		const { data } = await shops.findById(shop) || {};
		return data;
	}
};