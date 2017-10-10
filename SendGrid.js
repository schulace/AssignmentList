/**
 * Created by schulace on 10/9/17.
 */
const sgMail = require('@sendgrid/mail');
const sgKey = require('./SGkey');
sgMail.setApiKey(sgKey);
const msg = {
    to: 'schulace@gmail.com',
    from: 'test@example.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'this is the text',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
//function sendActivationEmail(to, subject)
sgMail.send(msg);
