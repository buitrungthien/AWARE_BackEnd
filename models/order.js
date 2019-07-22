const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerID: {
        type: String,
        required: true
    },
    orderedItem: {
        productID: {
            type: String,
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        chosenColor: {
            type: String,
            require: true
        },
        chosenSize: {
            type: String,
            required: true
        },
        chosenQuantity: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        required: true
    },
    orderedDate: {
        type: Date,
        default: new Date()
    }
});

const Order = mongoose.model('Order', orderSchema);

exports.Order = Order;