const _ = require('lodash');
const { Order } = require('../models/order');
const { Product } = require('../models/product');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const seller = require('../middleware/seller');

router.post('/', auth, async (req, res) => {
    let order = new Order(_.pick(req.body, ['customerID', 'orderedItem', 'status']));
    order.createdDate = new Date();
    const product = await Product.findById(order.orderedItem.productID);
    if (product.remain - order.orderedItem.chosenQuantity >= 0) {
        product.remain = product.remain - order.orderedItem.chosenQuantity;
        order.status = 'pending';
        await order.save();
        await product.save();
        return res.status(200).send();
    } else {
        return res.status(400).send('The quantity of this product is not enough in the stock');
    }
});

router.get('/', [auth, seller], async (req, res) => {
    let { pageSize, pageNumber } = req.query;
    pageSize = +pageSize;
    pageNumber = +pageNumber;
    let totalPages = 1;
    let orders = await Order.find();
    const numOfOrders = orders.length;
    totalPages = Math.ceil(numOfOrders / pageSize);
    orders = await Order
        .find()
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdDate: -1 })
        .select('-__v');
    res.send({ orders: orders, totalPages: totalPages, numOfOrders: numOfOrders });
});

router.patch('/', async (req, res) => {
    const { orderID, changedStatus } = req.query;
    const order = await Order.findOneAndUpdate({_id: orderID}, {status: changedStatus});
    res.status(200).send();
});

module.exports = router;