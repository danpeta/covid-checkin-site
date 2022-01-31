var express = require('express');
var session = require('express-session');
const path = require('path');
var router = express.Router();
var argon2 = require('argon2');

var ssn;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect("/login");
});

/* POST login page. */
// Need the response of this request for login session id*
router.post('/login', async function(req, res, next) {  // note use of async; you may need to move this to an inner function
    var email = req.body.email;
    var password = req.body.password;
    if(!(email)) {
        res.sendStatus(401);
        return;
    }
    if(!(password)) {
        res.sendStatus(401);
        return;
    }

    var query = "SELECT user_id, password FROM users WHERE email = ?";
    req.pool.getConnection(function(err, connection) {
        if(err) {
            res.sendStatus(500);
            return;
        }
        connection.query(query,[email], async function(err, rows, fields) {
            connection.release();
            if(err) {
                res.sendStatus(500);
                return;
            }

            if(rows.length < 1) {
                res.sendStatus(401);
                return;
            }

            try {
                if (await argon2.verify(rows[0].password, password)) {
                    ssn=req.session;
                    ssn.uid=rows[0].user_id;
                    res.sendStatus(200);
                    return;
                } else {
                    res.sendStatus(401);
                    return;
                }
            }
            catch (err) {
                // internal failure
                res.sendStatus(500);
                return;
            }
        });
    });
});

router.get('/login', function(req,res) {
    ssn = req.session;
    if(ssn.uid) {
        res.redirect("/home");
        return;
    }
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/signup', function(req,res) {
   res.sendFile(path.join(__dirname, '../public/signup.html'));
});

/* POST signup page. */
router.post('/signup', async function(req, res, next) {
    var user = req.body;

    var phash = null;
    try {
        phash = await argon2.hash(user.password);
    } catch (err) {
        res.sendStatus(500);
        return;
    }

    var query = "SELECT email FROM users WHERE email = ?";

    req.pool.getConnection(async function(err, connection) {
        if(err) {
            res.sendStatus(500);
            return;
        }
        connection.query(query,[user.email], function(err, rows, fields) {
            if(err) {
                res.sendStatus(500);
                return;
            }

            if(rows.length > 0) {
                res.sendStatus(400);
                return;
            }

            query = "INSERT INTO users (email, health_official, business_owner, given_name, last_name, mobile_number, password) VALUES(?, false, false, ?, ?, ?, ?)";

            connection.query(query,[user.email, user.given_name, user.last_name, user.mobile_number, phash], function(err, rows, fields) {
                if(err) {
                    res.sendStatus(500);
                    return;
                }

                var query = "SELECT user_id FROM users WHERE email = ?";

                connection.query(query,[user.email], function(err, rows, fields) {
                    if(err) {
                        res.sendStatus(500);
                        return;
                    }
                    ssn = req.session;
                    ssn.uid=rows[0].user_id;
                    res.sendStatus(200);
                });
            });
        });
        connection.release();
    });
});

router.get('/logout',function(req,res){
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.redirect('/');
    }
  });
});

// if logout is pressed
// send GET request "/logout"
// "home/logout"
// "/" == "/home"

module.exports = router;
