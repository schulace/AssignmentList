/**
 * Created by schulace on 9/18/17.
 */
const {Pool} = require('pg');
const pool = new Pool({
    host:'localhost',
    user:'alex',
    max:3,
    password:'schulace',
    database:'postgres',
    port:5432
});

module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    },
    getClient: (callback) => {
        pool.connect((err, client, done) => {
            const timeout = setTimeout(() => {
                console.error('connection has been open for waaaaay too long');
                done();
            }, 5000);
            const finish = () => {
                clearTimeout(timeout);
                console.log('client returned to pool');
                done();
            };
            callback(err, client, finish);
        });
    }
}
