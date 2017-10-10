const express = require('express');
const router = express.Router();
const db = require('../pgConnector');
const bcrypt = require('bcrypt');
const logIn = require('../LoginSessions');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/index.html');
});
router.post('/newuser', function (req, res, next) {
    console.log("creating new user");
    const body = req.body;
    const email = body.email;
    const name = body.name;
    const pass = body.password;
    bcrypt.hash(pass, 10, (err, hash) => {
        console.log("hashed");
        db.query('insert into users(name, pass_hash, email) values($1, $2, $3)', [name, hash, email], (err, dbres) => {
            console.log("queried");
            if (err) {
                console.error(err);
                res.status(500);
                res.send('an error occurred. there\'s probably a user with the same name or email')
            } else {
                res.send("success")
            }
        });
    })
});
router.post('/login', function(req, res, next) {
    const body = req.body;
    const email = body.email;
    const password = body.password;
    console.log('tried to log in')
    db.query('select pass_hash from users where email=$1', [email], (err, dbres) => {
        if(dbres.rows[0]) {
            bcrypt.compare(password, dbres.rows[0].pass_hash, (err, result) => {
                if(result) {
                    logIn.login(email, res);
                    res.send("logged in");
                } else {
                    res.status(401);
                    res.send("auth failed");
                }
            });
        }
    });
});
module.exports = router;
