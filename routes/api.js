/**
 * Created by schulace on 9/14/17.
 */
const express = require('express');
const db = require('../pgConnector');
const router = express.Router();
const loginChecker = require('./../LoginSessions');

//uncomment to check if people are logged in
router.use(loginChecker.check_login);
router.get('/posts', function (req, res) {
    res.responseType = 'application/json';
    //console.log('got request for posts: ' + JSON.stringify(req));
    db.query('select u.name as poster, coalesce(sum(votes.direction), 0) as score, u.title as title, u.postid as id from ( SELECT name, postid, title FROM posts NATURAL JOIN users ) as u left outer join votes using(postid) group by u.name, u.title, u.postid order by score desc;', [], (err, dbres) => {
        if (err) {
            console.err(err.message);
            res.send('db not available');
            return;
        }
        res.responseType = 'application/json';
        res.send(dbres.rows);
    });
});
router.get('/posts/:id', function (req, res) {
    const id = req.params.id;
    res.responseType = 'application/json';
    db.query('select postid as id, title, body, name from posts natural join users where postid=$1', [id], (err, dbres) => {
        if (err || !dbres.rows[0]) {
            console.log(err);
            res.status(500);
            res.send('error');
        }
        db.query('select name, usercomment from users natural join comments where postid=$1', [id], (err, dbres2) => {
            res.responseType = 'application/json';
            res.status(200);
            let retval = {
                postInfo: dbres.rows[0],
                postComments: dbres2.rows
            };
            res.send(retval);
        });
    });
});
//voting
router.put('/posts/:id', function (req, res) {
    const id = req.params.id;
    const body = req.body;
    //this will always exist because its required for login, which has happened at this point
    const email = req.cookies.email;
    const direction = body.direction == 'up' ? 1 : -1;
    db.query('select direction, userid from votes where postid = $1 and userid = (select userid from users where email=$2);', [id, email], (err, dbres) => {
        if (err) {
            console.log(err);
            res.send('error');
        }
        if (!dbres[0]) {
            db.query('insert into votes(userid, postid, direction) values(select userid from users where email=$1), $2, $3)', [email, id, direction], (err, dbres) => {
                if (err) {
                    console.log(err);
                    res.send(0);
                } else {
                    res.send({score: direction})
                }
            });
        }
        if (dbres[0].direction == direction) {
            res.type('application/json');
            res.send({score: 0});
        } else {

        }
    })
});
router.post('/posts', function (req, res) {
    const body = req.body;
    const title = body.title;
    const message = body.message;
    res.responseType = 'application/json';
    if (title == null || title == '' || title.length > 50 || message == null || message == '') {
        res.status = 401;
        res.redirect('/')
    } else {
        db.query('insert into posts(title, body, score) values($1, $2, 0) returning id as id', [title, message],
            (err, dbres) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/');
            }
        );
    }
});

module.exports = router;
