const mongoose = require('mongoose');
const s3Commands = require('../s3Helper');

const { Schema } = mongoose;

const productSchema = new Schema({
    name: String,
    description: String,
    price: String,
    sku: String,
    quantity: Number,
    stock: Number,
    photo: String,
    thumb: String,
    color: String,
    size: String,
    category: String
}, {
    virtuals: {
        signedUrl: {
            get() {
                return s3Commands.getSignedUrl(this.thumb);
            }
        }
    },
    query: {
        async withSignedUrl(id) {
            const product = await this.where({ _id: id});
            console.log(product);
            product.thumb = await s3Commands.getSignedUrl(product.thumb);
            return product;
        }
    }
});

const settings = new Schema({
    bannerText: String,
    bannerImage: String,
    promotion: [],
});

const Schemas = {
    product: productSchema,
    settings: settings,
}

module.exports = Schemas;