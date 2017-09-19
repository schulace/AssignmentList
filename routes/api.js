/**
 * Created by schulace on 9/14/17.
 */
const express = require('express');
const db = require('../pgConnector');
const router = express.Router();

router.get('/posts', function (req, res) {
    res.responseType = 'application/json';
    //console.log('got request for posts: ' + JSON.stringify(req));
    db.query('select * from posts order by id', [], (err, dbres) => {
        if (err) {
            console.log(err.message);
            return;
        }
        res.responseType = 'application/json';
        res.send(dbres.rows);
    });
});
router.get('/posts/:id', function (req, res) {
    const id = req.params.id;
    res.responseType = 'application/json';
    db.query('select id, body from posts where id=$1', [id], (err, dbres) => {
        if (err) {
            console.log(err);
            return;
        }
        res.send(JSON.stringify(dbres.rows[0]));
    });
});
router.post('/posts/:id', function (req, res) {
    const id = req.params.id;
    const body = req.body;
    const direction = body.direction == 'up' ? 1 : -1;
    db.query('update posts set score = score + $1 where id=$2 returning score as score', [direction, id], (err, dbres) => {
        if (err) {
            console.log(err);
            return;
        }
        res.responseType = 'application/json';
        res.send({score: dbres.rows[0].score});
    })
});

module.exports = router;
