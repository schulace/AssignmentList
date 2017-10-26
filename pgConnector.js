/**
 * Created by schulace on 9/18/17.
 */
const {Pool} = require('pg');
const {URL} = require('url');
const dbURL = new URL(process.env.DATABASE_URL);
const pool = new Pool({
    user: dbURL.username,
    host: dbURL.hostname,
    database: dbURL.pathname.substring(1),
    password: dbURL.password,
    port: dbURL.port
});
console.log(process.env.DATABASE_URL);

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
};
