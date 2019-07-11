const _ = require('lodash');
const { Product, validateProduct } = require('../models/product');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const seller = require('../middleware/seller');

router.post('/', [auth, seller], async (req, res) => {
    let product = new Product(_.pick(req.body, ['name', 'categoryOfGender', 'subCategory', 'quantity', 'price', 'imageURL', 'brand', 'sizes', 'colors', 'description']));
    product.remain = product.quantity;
    product.createdDate = new Date();
    await product.save();
    res.send(product);
});

module.exports = router;