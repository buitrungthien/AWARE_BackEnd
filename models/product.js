const Joi = require('joi');
const mongoose = require('mongoose');
const constant = require('../constants/index');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    images: [{type: String}],
    name: {
        type: String,
        required: true
    },
    categories: [{type: String}],
    quantity: {
        type: Number,
        required: true,
        min: 0,
        max: 1000
    },
    remain: {
        type: Number,
        required: true,
        min: 0,
        max: 1000
    },
    createdDate: {
        type: Date,
        default: new Date()
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    brand: {
        type: String,
        default: 'Unknown'
    },
    sizes: [{type: String}],
    colors: [{type: String}],
    description: {
        type: String
    }
});

const Product = mongoose.model('Product', productSchema);

function validateProduct(product) {
    const schema = {
        name: Joi.string().required().min(10).max(255),
        categories: Joi.string().required().valid(constant.CATEGORIES),
        quantity: Joi.number().min(0).max(1000).required(),
        imageURL: Joi.string(),
        brand: Joi.string().required(),
        price: Joi.number().min(0).required(),
        sizes: Joi.array().items(Joi.string().required().valid(constant.SIZES)),
        colors: Joi.array().items(Joi.string().required().valid(constant.COLORS)),
        description: Joi.string()
    };
    return Joi.validate(product, schema);
}

exports.Product = Product;
exports.validateProduct = validateProduct;