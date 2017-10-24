/**
 * Created by schulace on 9/14/17.
 */
const express = require('express');
const db = require('../pgConnector');
const router = express.Router();
const loginChecker = require('./../LoginSessions');

//uncomment to check if people are logged in
router.use(loginChecker.check_login);
router.get('/assignments', function (req, res) {
    res.responseType = 'application/json';
    let email = req.cookies.email;
    //console.log('got request for posts: ' + JSON.stringify(req));
    db.query('select title, duedate, completed, class_name, assignment_id from assignments natural join users natural join takes natural join classes where email=$1', [email], (err, dbres) => {
        if (err) {
            console.err(err.message);
            res.responseType = 'application/json';
            res.send({error:'db not available'});
            return;
        }
        res.responseType = 'application/json';
        res.send(dbres.rows);
    });
});
router.get('/subtasks/:id', function (req, res) {
    const id = req.params.id;
    res.responseType = 'application/json';
    db.query('select * from subtask where assignment_id = $1', [id], (err, dbres) => {
        if (err) {
            console.log(err);
            res.status(500);
            res.send({error:'error'});
        } else {
            res.responseType = 'application/json';
            res.send(dbres.rows);
        }
    });
});
//completing
router.put('/assignments/:id', function (req, res, next) {
    const id = req.params.id;
    const tick = req.body.tick;
    //this will always exist because its required for login, which has happened at this point
    console.log('tick is ', tick, '\nid is ', id);
    db.getClient((err, client, finish) => {
        res.responseType = 'application/json';
        if(err) {
            console.log(err);
            next(err);
            return;
        } 
        client.query('update assignments set completed=$1 where assignment_id=$2', [tick, id], (err, dbres) =>{
            if(err) {
                console.log(err);
                next(err);
                return;
            }
            client.query('update subtask set completed=$1 where assignment_id=$2', [tick, id], (err, dbres2) => {
                if(err) {
                    console.log(err);
                    next(err);
                    return;
                }
                res.status(200);
                res.send({completed:tick});
                finish(); //returning client to pool
            });
        });
    });
});
//creating a new class. so far untested
router.post('/class', function(req, res, next) {
    const body = req.body;
    const className = body.className;
    res.responseType = 'application/json';
    db.getClient((err, client, finish) => {
        if(err) {
            console.log(err);
            next(err);
        }
        const doDb = async () => {
            try {
                await client.query('BEGIN');
                const dbres = await client.query('insert into classes(class_name) values($1) returning class_id', [className]);
                await client.query('insert into takes(class_id, user_id) values($1, (select user_id from users where email=$2))', [dbres.rows[0], req.cookies.email]); 
                await client.query('COMMIT');
                res.status=200;
                res.send('success');
            } catch (err) {
                client.query('ROLLBACK');
                res.status=400;
                res.send('fail');
            } finally {
                finish();
            }
        };
        doDb();
    });

});
router.post('/assignments', function (req, res) {
    const body = req.body;
    const title = body.title;
    const message = body.message;
    res.responseType = 'application/json';
    if (title == null || title == '' || title.length > 50 || message == null || message == '') {
        res.status = 401;
        res.redirect('/');
    } else {
        db.query('insert into posts(title, body, score) values($1, $2, 0) returning id as id', [title, message],
            (err, dbres) => {
                if (err) {
                    console.log(err);
                }
                res.status(200);
                res.send(dbres.rows[0].id);
            }
        );
    }
});
module.exports = router;
