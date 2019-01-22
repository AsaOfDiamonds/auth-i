const express = require('express');
const configureMiddleware = require('./config/middleware');
const bcrypt = require('bcryptjs'); //yarn add bcryptjs
const db = require('./dbConfig');


const server = express();

// Middleware
configureMiddleware(server);

// routes and end points
server.post('/api/login', (req, res) => {
    // grab username and password from the body
    const creds = req.body;

    db('users')
        .where({ username: creds.username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(creds.password, user.password)) {
                // passwords match and user exists by that username
                res.status(200).json({ message: 'Welcome!' });
            } else {
                // either username is invalid or password is wrong
                res.status(401).json({ message: 'you shall not pass!!' });
            }
        })
        .catch(err => res.json(err));
});


server.post('/api/register', (req, res) => {
    // grab username and password from the body
    const creds = req.body;

    // generate the has from the user's password
    const hash = bcrypt.hashSync(creds.password, 14); //rounds is 2^X in this case it is 2^14
    // override the user.password with the hash
    creds.password = hash;
    // save the user to the database
    db('users')
        .insert(creds)
        .then(ids => {
            res.status(201).json(ids);
        })
        .catch(err => json(err));
});


server.get('/', (req, res) => {
    res.send('Number 5 is Alive!!!!')
});

// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
    db('users')
        .select('id', 'username', 'password') // **** changed this for class*** never ever send password back!! leave it out
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
});




module.exports = server;