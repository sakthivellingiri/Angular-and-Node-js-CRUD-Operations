var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
//   service: 'gmail',
  host: "smtp.zoho.com", // Correct SMTP server hostname
  port: 465,
  secure: true,
  auth: {
    user: 'sakthivj@zohomail.com',
    pass: 'S@kthi9629'
  }
});

var mailOptions = {
  from: 'sakthivj@zohomail.com',
  to: 'sakthivj0103@gmail.com',
  subject: 'Good Afternoon',
  text: 'Hi Sir'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});