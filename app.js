const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/users');
const login = require('./routes/login');
const config = require('config');
const error = require('./middleware/error');
const app = express();
require('express-async-errors');

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

mongoose.connect('mongodb://localhost/awaredb')
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Could not coneect to MongoDB...', err));

// Middlewares
app.use(express.json());
app.use('/api/users', users);
app.use('/api/login', login);

app.use(error);

//PORT
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});