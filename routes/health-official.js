var express = require('express');
const path = require('path');
var router = express.Router();
var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    proxy: 'http://194.195.253.34',
    auth: {
        user: 'hosea.wiza80@ethereal.email',
        pass: 'BTAFbeeaUeBv1Aaphe'
    }
});

router.use(function (req, res, next) {
    ssn = req.session;
    var uid = ssn.uid;
    var query = "SELECT health_official FROM users WHERE user_id = ?";

    req.pool.getConnection(function(err,connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        connection.query(query,[uid], function(err, rows, fields) {
            connection.release();
            if(err) {
                res.sendStatus(500);
                return;
            }
            if(rows[0].health_official == true) {
                next();
                return;
            }
            else {
                res.sendStatus(401);
            }
        });
    });
});

/* GET health-official page. */
router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/health-official.html'));
});

// GET manage-hotspots
router.get('/manage-hotspots', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/manage-hotspots.html'));
});

router.post('/manage-hotspots', function(req,res) {

   var code = req.body.code;

    if(!code) {
       res.sendStatus(400);
       return;
    }

    req.pool.getConnection(function(err,connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = "SELECT code FROM businesses WHERE code = ?";
        connection.query(query,[code], function(err, rows, fields) {
            if(err) {
                res.sendStatus(500);
                return;
            }
            if(rows.length < 1) {
                res.sendStatus(400);
                return;
            }
            query = "SELECT hotspot FROM businesses WHERE code = ?";
            connection.query(query,[code], function(err, rows, fields) {
                if(err) {
                    res.sendStatus(500);
                    return;
                }
                if(rows[0].hotspot == true) {
                    res.sendStatus(406);
                    return;
                }
                query = "UPDATE businesses SET hotspot = true WHERE code = ?";
                connection.query(query,[code], function(err, rows, fields) {
                    if(err) {
                        res.sendStatus(500);
                        return;
                    }
                    // query = "SELECT DISTNICT id FROM user_checkin_history WHERE business_code = ?";
                    query = "SELECT DISTINCT users.email FROM user_checkin_history INNER JOIN users ON user_checkin_history.id = users .user_id WHERE user_checkin_history.business_code = ?, users.notification_been_to_hotspot = true";
                    connection.query(query,[code], async function(err, rows, fields) {
                        if(err) {
                            res.sendStatus(500);
                            return;
                        }
                        if(rows.length < 1) {
                            res.sendStatus(200);
                            return;
                        }

                        var i;
                        var messages = [];
                        for(i=0;i<rows.length;i++) {
                            let info = await transporter.sendMail({
                                from: '"hosea.wiza80@ethereal.email"',
                                to: rows[i].email,
                                subject: "SA Government - Covid-19 Contact Tracing",
                                text: "You have visited a location where there has been a confirmed case of covid-19. Please self isolate for 14 days and contact your health provider if you experience symptoms.",
                                html: "<p><b>Hello</b> to myself!</p>",
                            });
                        }

                        res.send();

                    });
                });
            });
        });
    connection.release();
    });
});

// POST manage-hotspots

// GET search/results
router.get('/search/results', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/results.html'));
});

// POST search/results

// GET search
router.get('/search', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/search.html'));
});


// POST search

// POST add-health-official

// GET add-health-official
router.get('/add-health-official', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/signup-officials.html'));
});

router.post('/add-health-official/admin', function(req, res){
    var email=req.body.email;
    var query= "UPDATE users SET health_official=true WHERE email=?";

    req.pool.getConnection(function(err,connection){
        if (err){
            res.sendStatus(500);
            return;
        }
        connection.query(query,[email], function(err,rows,fields){
            if (err){
                res.sendStatus(500);
                return;
            }
            res.sendStatus(200);
            return;
        });
        connection.release();
    });
});

router.post('/add-health-official/email', function(req, res){
    var email=req.body.email;
    var query = "SELECT given_name, last_name,health_official FROM users WHERE email = ?";

    req.pool.getConnection(function(err,connection){
        if (err){
            res.sendStatus(500);
            return;
        }
        connection.query(query,[email], function(err,rows,fields){
            if (err){
                res.sendStatus(500);
                return;
            }
            if (rows.length < 1){
                res.sendStatus(400);
                return;
            }
            if (rows[0].health_official==true){
                res.sendStatus(201);
                return;
            }

            var details = {"given_name":rows[0].given_name, "last_name":rows[0].last_name };
            res.status(200).send(details);
            return;

        });
        connection.release();
    });
});

module.exports = router;
