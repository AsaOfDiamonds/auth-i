const express = require('express');
const configureMiddleware = require('./config/middleware');
const bcrypt = require('bcryptjs'); //yarn add bcryptjs
const db = require('./dbConfig');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);


const server = express();

// Middleware
configureMiddleware(server);

// routes and end points

const sessionConfig = {
    name: 'TrevorFehrman',
    secret: 'thewolfpackisbackjackleavetheblackwidowalone'
    cookie: {
        maxAge: 1000 * 60 * 5, // in milliseconds
        secure: false, // true during production, only send the cookie over https
    },
    httpOnly: true, // js can't touch this
    resave: false, 
    saveUninitialized: false,
    store: new KnexSessionsStore({
        tablename: 'sessions',
        sidfilename: 'sid',
        knex: db,
        createtable: true,
        clearInterval: 1000 * 60 * 10,
    }),
};




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

function protected(req, res, next) {
    // if the user is logged in next
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'You shall not pass!!! not authenticated'});
    }
}

// protect this endpoint so that only logged in users can see it
server.get('/users', protected, async (req, res) => {
    const users = await db('users');

    res.status(200).json(users);
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