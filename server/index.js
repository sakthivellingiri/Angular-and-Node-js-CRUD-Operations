const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const nodemailer = require("nodemailer");

const app = express();
const port = 3550;

app.use(cors());
app.use(bodyParser.json());

//database(connection)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'S@kthi9629',
    database: 'ccl'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Create a route to handle user registration
app.post('/register', (req, res) => {
    const user = req.body;

    db.query('INSERT INTO register (username, email, password) VALUES (?, ?, ?)',
        [user.username, user.email, user.password],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error registering user');
            } else {
                res.status(200).send('User registered successfully');
            }
        }
    );
});

// data base mysql to client side login form
app.post('/userlogin', (req, res) => {
    const { email, password } = req.body;
    db.query('select * from register where email=?', [email], (error, result) => {
        if (error) {
            console.log(error)
            res.send({ "status": "empty_set" })
        }
        else if (result.length > 0) {
            let dbemail = result[0].email
            let dbpassword = result[0].password
            let id = result[0].id
            if (dbemail === email && dbpassword === password) {
                res.send({ "status": "success", "id": id })
            }
            else {
                res.send({ "status": "invalid_user" })
            }
        }
        else {
            res.send({ "status": "error" })
        }
    })
})

// get single data
app.get('/client/:id', (req, res) => {
    let { id } = req.params
    let sql = 'select * from register where id=?'
    db.query(sql, [id], (error, result) => {
        if (error) {
            res.send(error)
            console.log(error)
        }
        else {
            res.send(result)
        }
    })
})
//delete
app.post('/delete/:id', (req, res) => {
    let id = req.params.id
    let sql = 'delete from register where id=?'
    db.query(sql, [id], (error, result) => {
        if (error) {
            res.send({ "status": "error" })
            console.log(error)
        }
        else {
            res.send({ "status": "success" })
            console.log()
        }
    })

})

//update

app.put('/updateuser', (req, res) => {
    let { id } = req.params
    console.log(id)
    let { username, email, password } = req.body
    let sql = 'update register set username=?,email=?,password=? where id=?';
    db.query(sql, [username, email, password, id], (error, result) => {
        if (error) {
            res.send({ "status": "error" })
            console.log(error)
        }
        else {
            res.send({ "status": "success" })
        }
    })
})

// this api checkemailid in forgotpassword to checkemailid is already in databases are not

app.put('/checkemailid', (req, res) => {
    const { email } = req.body;
    const sql = 'SELECT * FROM register WHERE email = ?';
    db.query(sql, [email], (error, result) => {
        if (error) {
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        } else {
            if (result.length > 0) {
                res.json({ status: 'success', message: 'Email exists in the database' });
            } else {
                res.json({ status: 'error', message: 'Email does not exist in the database' });
            }
        }
    });
});


const userMail = "sakthivj@zohomail.com";
const password = "S@kthi9629"

// Create a nodemailer transport with the correct SMTP settings
const sender = nodemailer.createTransport({
    host: "smtp.zoho.com", // Correct SMTP server hostname
    port: 465,
    secure: true,
    auth: {
        user: userMail,
        pass: password // Use 'pass' instead of 'password' for the password field
    },
});



app.post('/emailsender/:id', async (req, res) => {
    const { email } = req.body;

    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000);
    }
    const otp = generateOTP();

    
    const sql = 'update register set otp = ?  where email = ?';
    db.query(sql,[otp,email])

    try {
        const composeEmail = {
            from: userMail,
            to: email,
            subject: 'FORGOT PASSWORD OTP',
            html: `<h1>Your OTP code is  ${otp} </h1>` // Include the OTP in the email
        };

        var emailResponse = await sender.sendMail(composeEmail);
        console.log('Email sent', JSON.stringify(emailResponse));
        return res.status(200).json({ "status": "success", "message": "Mail sent successfully" });
    } catch (err) {
        console.error(res.status(500).json({ "status": "error", "message": err.message }));
        return res.status(500).json({ err: 'Error sending email' });
    }

});

//otp//page

app.put('/otppage', (req, res) => {
    const { otpsubmit } = req.body;
    const sql = 'SELECT * FROM register WHERE email = ?';
    db.query(sql, [otpsubmit], (error, result) => {
        if (error) {
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        } else {
            if (result) {
                res.json({ status: 'success', message: 'Email exists in the database' });
            } else {
                res.json({ status: 'error', message: 'Email does not exist in the database' });
            }
        }
    });
});
//new password

app.put('/newpassword', (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Invalid data' });
    }
  
    // Perform the database operation to update the password
    const sql = 'UPDATE register SET password = ? WHERE email = ?'; // Replace 'users' with your table name
    db.query(sql, [password, email], (err, result) => {
      if (err) {
        console.error('Error updating password: ' + err);
        return res.status(500).json({ status: 'error', message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'Email not found' });
      }
      console.log('Password updated successfully');
      res.status(200).json({ status: 'success', message: 'Password updated' });
    });
  });


  ///////////////////////////////////////new project/////////////


//insert add product
// app.post('/addproduct', (req, res) => {
//     const user = req.body;
//     console.log(user);
//     db.query('INSERT INTO amazon (title, price, Category,rating) VALUES (?, ?, ?,?)',
//         [user.title, user.price, user.category,user.rating],
//         (err, results) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).send('Error registering user');
//             } else {
//                 res.status(200).send('User registered successfully');
//             }
//         }
//     );
// });
app.post('/addEditProduct', (req, res) => {
    const user = req.body;
    console.log(user);
    db.query('INSERT INTO amazon (title, price, Category,rating) VALUES (?, ?, ?,?)',
        [user.title, user.price, user.category,user.rating],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error registering user');
            } else {
                res.status(200).send('User registered successfully');
            }
        }
    );
});

/// get product 
app.get('/getproduct', (req, res) => {
    let { id } = req.params
    let sql = 'select * from amazon'
    db.query(sql, [id], (error, result) => {
        if (error) {
            res.send(error)
            console.log(error)
        }
        else {
            res.send(result)
        }
    })
})

app.delete('/deleteproduct/:sno', (req, res) => {
    const sno = req.params.sno;
    console.log(sno)
    const sql = 'DELETE FROM amazon WHERE sno = ?';
    db.query(sql, [sno], (error, result) => {
      if (error) {
        res.status(500).json({ status: 'error', message: 'Failed to delete the product' });
        console.error(error);
      } else {
        res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
      }
    });
  });

  app.put('/editproduct/:sno', (req, res) => {
    const {sno} = req.params;
    const {title,price,category,rating}=req.body
    const sql='update amazon set title=?,price=?, category=?,rating=? where sno=?';
    db.query(sql,[title, price, category, rating, sno ],(error,result)=>{
        if(error){
            res.send({"status":"error"})
            console.log(error);
        }else{
            res.send({"status":"success"})
        }
    })
  })

































app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
