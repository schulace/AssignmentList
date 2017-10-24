/**
 * Created by schulace on 10/5/17.
 */

let login_table = {};

//had to user arrow functions so that the context allows it to grab login_table
module.exports = {
    check_login: (req, res, next) => {
        let email = req.cookies.email;
        let hash = req.cookies.hash;
        console.log(req.cookies);
        if ((login_table[email] === hash) && email && hash) {
            next();
        } else {
            res.status(401);
            res.send('not logged in');
        }
    },
    logOut: (req) => {
        const email = req.cookie('email');
        if (email) {
            login_table[email] = null;
        }
    },
    login: (email, res) => {
        const rand = Math.random().toString(36);
        res.cookie('email', email);
        res.cookie('hash', rand);
        login_table[email] = rand;
    }
};
