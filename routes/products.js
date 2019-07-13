const _ = require('lodash');
const { Product, validateProduct } = require('../models/product');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const seller = require('../middleware/seller');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:|\./g, '') + file.originalname);
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

router.post('/images', upload.single('productImage'), async (req, res) => {
    path = req.file.path;
    res.send('http://localhost:5000/' + path);
});

router.post('/', [auth, seller], async (req, res) => {
    let product = new Product(_.pick(req.body, ['name', 'categoryOfGender', 'subCategory', 'quantity', 'price', 'imageURL', 'brand', 'sizes', 'colors', 'description']));
    product.remain = product.quantity;
    product.createdDate = new Date();
    await product.save();
    res.send(product);
});

module.exports = router;