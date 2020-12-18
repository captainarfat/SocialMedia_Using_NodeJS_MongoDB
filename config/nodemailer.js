const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const env = require('./environment');



let transporter = nodemailer.createTransport(env.smtp);

let renderTemplate = (data, relativePath) => {
    let mailHtml;
    ejs.renderFile(
     path.join(__dirname, '../views/mailers', relativePath),
     data,
     function(err, template){
         if(err){
             console.log('Error In Mailer', err);
             return;
         }
         mailHtml = template;
     }   
    )

    return mailHtml;
}

module.exports = {
    transporter: transporter,
    renderTemplate: renderTemplate
}