const _ = require('lodash');
const { Product, validateProduct } = require('../models/product');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const seller = require('../middleware/seller');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:|\./g, '') + Math.random() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'imgae/png') {
        cb(null, true);
    } else {
        cb(new Error('only support jpeg and png files'), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/:id', async (req, res) => {
    let product = await Product.findById(req.params.id);
    let moreFrom = await Product
        .find({ brand: product.brand })
        .limit(4);
    res.send({ product: product, moreFrom: moreFrom });
});

router.get('/', async (req, res) => {
    let { gender, subcategory, category, pageNumber, pageSize = 20 } = req.query;
    let totalPages = 1;
    let queryArray = [];
    pageNumber = +pageNumber;
    pageSize = +pageSize;
    gender ? queryArray.push(gender) : null;
    subcategory ? queryArray.push(subcategory) : null;
    category !== 'all' ? queryArray.push(category) : null;
    if (queryArray.length === 0) {
        let products = await Product
            .find();
        const numOfProducts = products.length;
        totalPages = Math.ceil(products.length / pageSize);
        products = await Product
            .find()
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ createdDate: -1 })
            .select('-__v');
        return res.send({ products: products, totalPages: totalPages, numOfProducts: numOfProducts });
    }
    let products = await Product
        .find({ categories: { $all: queryArray } });
    totalPages = Math.ceil(products.length / pageSize);
    const numOfProducts = products.length;
    products = await Product
        .find({ categories: { $all: queryArray } })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdDate: -1 })
        .select('-__v');
    return res.send({ products: products, totalPages: totalPages, numOfProducts: numOfProducts });
});

router.get('/images', async (req, res) => {
    const products = await Product.find();
    res.send(products);
});

router.post('/images', [auth, seller], upload.single('productImage'), async (req, res) => {
    path = req.file.path;
    res.send(path);
});

router.delete('/images', [auth, seller], async (req, res) => {
    const reqImgPath = req.headers.imgpath;
    fs.unlink(reqImgPath, err => {
        err ? console.log(err) : null;
    });
    res.status(200).send();
});

router.post('/', [auth, seller], async (req, res) => {
    let product = new Product(_.pick(req.body, ['images', 'name', 'categories', 'quantity', 'price', 'imageURL', 'brand', 'sizes', 'colors', 'description']));
    product.remain = product.quantity;
    product.createdDate = new Date();
    await product.save();
    res.send(product);
});

module.exports = router;