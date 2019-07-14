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
    let product = new Product(_.pick(req.body, ['images', 'name', 'categoryOfGender', 'subCategory', 'quantity', 'price', 'imageURL', 'brand', 'sizes', 'colors', 'description']));
    product.remain = product.quantity;
    product.createdDate = new Date();
    await product.save();
    res.send(product);
});

module.exports = router;