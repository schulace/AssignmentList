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
    db.query('select title, duedate, completed, class_name, assignment_id, class_id from assignments natural join users natural join takes natural join classes where email=$1', [email], (err, dbres) => {
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
        (async function() {
            try {
                //security check to make sure some1 doesn't just modify the URL and change data that's not theirs
                const res1 = await client.query('select email from users natural join takes natural join assignments where assignment_id=$1', [id]);
                if(!res1.rows[0] || res1.rows[0].email !== req.cookies.email) {
                    res.status=401;
                    throw new Error('unauthorized');
                }
                await client.query('update assignments set completed=$1 where assignment_id=$2', [tick, id]);
                await client.query('update subtask set completed=$1 where assignment_id=$2', [tick, id]);
                res.status(200);
                res.send({completed:tick});
            } catch(err) {
                next(err);
            } finally {
                finish();
            }
        })();
    });
});
//creating a new class. so far untested
router.post('/classes', function(req, res, next) {
    const body = req.body;
    const className = body.className;
    res.responseType = 'application/json';
    db.getClient((err, client, finish) => {
        if(err) {
            console.log(err);
            next(err);
        }
        (async function() { //IIFE
            try {
                await client.query('BEGIN');
                const dbres = await client.query('insert into classes(class_name) values($1) returning class_id', [className]);
                const idres = await client.query('insert into takes(class_id, user_id) values($1, (select user_id from users where email=$2)) returning class_id', [
                    dbres.rows[0].class_id,
                    req.cookies.email
                ]); 
                await client.query('COMMIT');
                res.status=200;
                res.send({
                    class_name:className,
                    class_id:idres.rows[0].class_id
                });
            } catch (err) {
                client.query('ROLLBACK');
                res.status=400;
                res.send('fail');
                console.log(err);
            } finally {
                finish();
            }
        })();
    });
});
router.get('/classes', function(req, res, next) {
    const email = req.cookies.email;
    (async function() { //gotta love them IIFE's boi
        try {
            const dbres = await db.query('select class_name, class_id from classes natural join takes natural join users where email=$1', [email]); 
            res.status=200;
            res.responseType='json';
            res.send(dbres.rows);
        } catch (err) {
            next(err);
        }
    })();
});
router.delete('/classes/:id', function(req,res,next) {
    const email = req.cookies.email;
    const class_id = req.params.id;
    console.log('email: ', email, '\nclass_id: ', class_id);
    db.getClient(function(err, client, finish) {
        (async function() {
            try {
                const res1 = await client.query('select user_id from users natural join takes where email = $1 and class_id = $2', [email, class_id]);
                if(!res1.rows[0]) {
                    throw new Error('you don\'t take this course');
                }
                await client.query('delete from classes where class_id=$1', [class_id]);
                //use next line if you're going to end up doing things where multiple people can share an assignment and a class
                //await client.query('delete from takes where user_id = $1 and class_id = $2', [res1.rows[0].user_id, class_id]);
                res.status = 200;
                res.send({id:class_id});
            } catch (err) {
                res.status = 401;
                res.send({id:-1});
                next(err);
            } finally {
                finish();
            }
        })();
    });
});
router.post('/assignments', function (req, res, next) {
    res.responseType = 'application/json';
    console.log('body is ', req.body);
    const title = req.body.assignmentTitle;
    const email = req.cookies.email;
    db.getClient(function(err, client, finish) {
        (async function() { //TODO clean up and write more code so you only open a connection if you really have to
            try {
                if (!title || title == '' || title.length > 50) {
                    throw new Error('bad title');
                }
                let duedate = new Date(req.body.dueDate);
                if (isNaN(duedate.getTime())) {
                    duedate = null;
                }
                const class_id = req.body.selectedClass ? req.body.selectedClass.class_id : null;
                if(!class_id) {
                    throw new Error('bad class id');
                }
                const res1 = await client.query('select user_id from users natural join takes where email = $1 and class_id = $2', [email, class_id]);
                if(!res1.rows[0]) {
                    throw new Error('bad class id');
                }
                const ret2 = await client.query('insert into assignments(user_id, class_id, title, comment, duedate, completed) values($1, $2, $3, $4, $5, $6)' +
                    'returning assignment_id', [
                    res1.rows[0].user_id,
                    class_id,
                    title,
                    req.body.assignmentDescription,
                    duedate,
                    false
                ]);
                res.status=200;
                const retval = ret2.rows[0];
                retval.class_id = class_id;
                res.send(retval);
            } catch (err) {
                res.status=403;
                res.send({error:err.message});
                next(err);
            } finally {
                finish();
            }
        })();
    });
});
module.exports = router;
