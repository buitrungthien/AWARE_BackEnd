const _ = require('lodash');
const { User, validateNewUser, validateChangeInfoUser } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const seller = require('../middleware/seller');


router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.get('/seller', [auth, seller], async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validateNewUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.isSeller = false;

    await user.save();

    res.send(_.pick(user, ['_id', 'name', 'email']));
});

router.patch('/', auth, async (req, res) => {
    let updatedUser = {};
    if (req.body.email) {
        const user = await User.findOne({email: req.body.email});
        if (user && (user._id != req.user._id)) return res.status(400).send('This email is already exist.');
        updatedUser = await User.findOneAndUpdate({_id: req.user._id}, {email} = req.body).select('-password');
    } else {
        updatedUser = await User.findOneAndUpdate({_id: req.user._id}, {name} = req.body).select('-password');
    }
    res.send(updatedUser);
});

router.put('/', auth, async (req, res) => {
    let updatedUser = {};
    const user = await User.findOne({email: req.body.email});
    if (user && (user._id != req.user._id)) return res.status(400).send('This email is already exist.');
    updatedUser = await User.findOneAndUpdate({_id: req.user._id}, {email, name} = req.body).select('-password');
    res.send(updatedUser);
});

module.exports = router;