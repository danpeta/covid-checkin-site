var express = require('express');
const path = require('path');
var ssn;
var router = express.Router();
var argon2 = require('argon2');


router.use(function (req, res, next) {
    ssn = req.session;
    if(ssn.uid) {
        next();
        return;
    }
    res.redirect("/login");
});

/* GET home page. */
router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/home.html'));
    return;
});

router.post('/user_alt', function(req,res){

    var alternate = req.body.user_alt;
    ssn=req.session;


    req.pool.getConnection(function(err,connection){
       if (err) {
            res.sendStatus(500);
            return;
        }
        var query="SELECT user_id FROM users WHERE email=?";
        connection.query(query, [alternate], function(err, rows, fields){
            if (err) {
            res.sendStatus(500);
            return;
            }
            if (rows.length<1){
                res.sendStatus(400);
                return;
            }
            ssn.user_alt=rows[0].user_id;
            console.log("zoo wee mama");
            console.log(ssn.user_alt);
            res.sendStatus(200);

            return;

        });
        connection.release();

    });
});

router.post('/check-in', function(req,res) {
    console.log("here \n");
   ssn = req.session;
   var uid=ssn.uid;
   var code=req.body.id;
   var date=req.body.date;

   console.log(req.body);

   var query = "SELECT code FROM businesses WHERE code = ?";
   req.pool.getConnection(function(err,connection){
       if (err) {
            res.sendStatus(500);
            return;
        }
        console.log("1 \n");
        connection.query(query, [code], function(err,rows, fields){
            if (err) {
                res.sendStatus(500);
                return;
            }
            console.log(code);
            console.log(rows.length);
            if (rows.length > 0) {
                // console.log("2 \n");
                query = "INSERT INTO user_checkin_history (id, business_code, date) VALUES (?,?,?)";
                connection.query(query, [uid, code, date], function(err,rows, fields){
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    query = "INSERT INTO business_checkin_history (id, date) VALUES (?,?)";
                    connection.query(query, [code, date], function(err,rows, fields){
                        if (err) {
                            res.sendStatus(500);
                            return;
                        }
                        res.sendStatus(200);
                        return;
                    });
                });
            }
            else {
                res.sendStatus(400);
                return;
            }

        });
        connection.release();
   });
});

// Could change this to be part of /home but with a check using if(req.is('json'))
router.get('/name', function(req, res) {
    ssn=req.session;


    var uid=ssn.uid;
    var query = "SELECT given_name, last_name, business_owner, health_official FROM users WHERE user_id = ?";
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
            var object = {given_name: rows[0].given_name, last_name: rows[0].last_name, business_owner: rows[0].business_owner, health_official: rows[0].health_official};
            res.json(object);
            return;
        });
    });
});

// GET account-details
router.get('/account-details', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/account-details.html'));

});

router.get('/account-details/details', function(req, res) {
    ssn=req.session;
    var uid;

    console.log(ssn.user_alt);
    if (ssn.user_alt===null ||ssn.user_alt ===  undefined){
        uid= ssn.uid;
    }
    else {
        uid=ssn.user_alt;
        ssn.user_alt=null;
        console.log(ssn.user_alt);
    }


    var query = "SELECT email, given_name, last_name, mobile_number FROM users WHERE user_id = ?";
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
            var object = {email: rows[0].email, given_name: rows[0].given_name, last_name: rows[0].last_name, mobile_number: rows[0].mobile_number};
            res.json(object);
            return;
        });
    });
});

router.post('/account-details', function(req, res, next) {
    var user = req.body;
    ssn=req.session;
    var uid;//=ssn.uid;
    var query;

    if (ssn.user_alt===null ||ssn.user_alt ===  undefined){
        uid= ssn.uid;
        console.log(uid);

        if(!user.current_password) {
        res.status(401).send('Please enter your password.')
        return;
    }
    }
    else {
        uid=ssn.user_alt;
        ssn.user_alt=null;
        console.log(uid);
    }



    if(user.email && user.last_name && user.given_name && user.mobile_number) {
        req.pool.getConnection(function(err,connection) {
            if (err) {
                console.log("Error Getting Connection");
                res.sendStatus(500);
                return;
            }

            query = "SELECT password FROM users WHERE user_id = " + uid;

            connection.query(query, async function(err, rows, fields) {
                if(err) {
                    console.log("Error Getting Query 1");
                    res.sendStatus(500);
                    return;
                }
                if(rows.length < 1) {
                    res.sendStatus(500);
                    console.log("Couldn't Find User");
                    return;
                }

                try {
                    if (!(await argon2.verify(rows[0].password, user.current_password))) {
                        res.status(401).send('Invalid Password.');
                        return;
                    }
                }
                catch (err) {
                    console.log("Error Verifying Password");
                    res.sendStatus(500);
                    return;
                }

                query = "SELECT user_id, email FROM users WHERE email = ?";
                connection.query(query,[user.email], function(err, rows, fields) {
                    if(err) {
                        console.log("Error Getting Query 2");
                        res.sendStatus(500);
                        return;
                    }
                    if(rows.length > 0 && rows[0].user_id != uid) {
                        res.status(401).send('Email is already in use.');
                        return;
                    }

                    console.log(user.notifications);

                    // var isTrue = (user.notifications === 'true');

                    // console.log(isTrue);

                    query = "UPDATE users SET given_name = ?, last_name = ?, mobile_number = ?, email = ?, notification_been_to_hotspot = ? WHERE user_id = ?";
                    connection.query(query,[user.given_name, user.last_name, user.mobile_number, user.email, user.notifications, uid], async function(err, rows, fields) {
                        if(err) {
                            console.log(err);
                            console.log("Error Getting Query 3");
                            res.sendStatus(500);
                            return;
                        }
                        if(user.new_password) {
                            var phash = null;
                            try {
                                phash = await argon2.hash(user.new_password);
                            } catch (err) {
                                res.sendStatus(500);
                                console.log("Error Hashing");
                                return;
                            }

                            query = "UPDATE users SET password = ? WHERE user_id = " + uid;
                            connection.query(query,[phash], function(err, rows, fields) {
                                if(err) {
                                    console.log("Error Getting Query 4");
                                    res.sendStatus(500);
                                    return;
                                }
                                res.sendStatus(200);
                                return;
                            });
                        }
                        else {
                            res.sendStatus(200);
                            return;
                        }
                    });
                });
            });
            connection.release();
        });
    }
    else {
        res.status(400).send('Detail fields empty.');
        return;
    }
});

// POST check-in
router.post('/home', function(req, res){

});

// GET add-business
router.get('/add-business', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/add-business.html'));
});

// POST add-business
router.post('/add-business', function(req, res) {

    ssn=req.session;
    var uid = ssn.uid;

    var business = req.body;
    var query;

    var name = business.business_name;
    var type = business.business_type;
    var email = business.business_email;
    var phone = business.phone_number;

    var street_no = business.street_number;
    var street_name = business.street_name;
    var suburb = business.suburb;
    var state = business.state;
    var postcode = business.postcode;

    var capacity = parseInt(business.capacity);
    var code = business.code;

    if(name && type && email && phone && street_no && street_name && suburb && state && postcode && capacity && code) {
        req.pool.getConnection(function(err,connection) {
            if (err) {
                res.sendStatus(500);
                return;
            }
            query = "SELECT code FROM valid_codes WHERE code = ?";
            connection.query(query,[code], function(err, rows, fields) {
                if(err) {
                    console.log("Error finding code in businesses.");
                    res.sendStatus(500);
                    return;
                }
                if(rows.length < 1) {
                    res.sendStatus(403);
                    return;
                }

                query = "SELECT code FROM businesses WHERE code = ?";

                connection.query(query,[code], function(err, rows, fields) {
                    if(err) {
                        console.log("Error finding code in businesses.");
                        res.sendStatus(500);
                        return;
                    }

                    if(rows.length > 0) {
                        res.sendStatus(401);
                        return;
                    }

                    // We tried to use multiple statements here to ensure if a row was inserted into businesses a row was also inserted into business_address, however, due to how express server is configured we were unable to get this working.

                    query = "INSERT INTO businesses (owner_id, business_name, business_email, phone_number, code, industry, persons_capacity) VALUES (?, ?, ?, ?, ?, ?, ?)";

                    connection.query(query,[uid, name, email, phone, code, type, capacity], function(err, rows, fields) {
                        if(err) {
                            console.log(err);
                            console.log("Error inserting into businesses.");
                            res.sendStatus(500);
                            return;
                        }

                        query = "INSERT INTO business_address (id, address_no, address_street, address_suburb, address_state, address_postcode) VALUES (?, ?, ?, ?, ?, ?)";
                        connection.query(query,[code, street_no, street_name, suburb, state, postcode], function(err, rows, fields) {
                            if(err) {
                                console.log("Error inserting into business_address.");
                                res.sendStatus(500);
                                return;
                            }
                            query= "UPDATE users SET business_owner=true WHERE user_id= ?";
                            connection.query(query,[uid], function(err, rows, fields){
                                if(err){
                                    console.log("failed to make business owner");
                                    res.sendStatus(500);
                                    return;
                                }

                            });
                            res.sendStatus(200);
                        });
                    });
                });
            });
            connection.release();
        });
    }
    else {
        res.sendStatus(400);
        return;
    }
});

// GET check-in-history

router.get('/check-in-history', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/u-check-in-history.html'));
});

router.get('/check-in-history/data', function(req, res) {

    ssn=req.session;
    var uid;

    console.log(ssn.user_alt)
    if (ssn.user_alt===null ||ssn.user_alt ===  undefined){
        uid= ssn.uid;
    }
    else {
        uid=ssn.user_alt;
        ssn.user_alt=null;
    }

    req.pool.getConnection(function(err,connection){

        var query= "SELECT date FROM user_checkin_history WHERE id = ? ORDER BY date DESC LIMIT 10";
        connection.query(query,[uid], function(err, rowsA, fields){
            if(err){
                res.sendStatus(500);
                return;
            }
            if(rowsA.length<1){
                res.sendStatus(400);
                return;
            }

            query= "SELECT address_no, address_street, address_suburb, address_state, address_postcode FROM business_address " +
                    "INNER JOIN user_checkin_history ON business_address.id = user_checkin_history.business_code "+
                    "WHERE user_checkin_history.id= ? ORDER BY user_checkin_history.date DESC LIMIT 10;"

            connection.query(query,[uid], function(err, rowsB, fields){
                if(err){
                    res.sendStatus(500);
                    return;
                }
                if(rowsB.length<1){
                    res.sendStatus(400);
                    return;
                }
                query="SELECT business_name, hotspot FROM businesses INNER JOIN user_checkin_history ON businesses.code = user_checkin_history.business_code WHERE user_checkin_history.id= ? ORDER BY user_checkin_history.date DESC LIMIT 10";

                connection.query(query,[uid], function(err, rowsC, fields){
                    if(err){
                        res.sendStatus(500);
                        return;
                    }
                    if(rowsC.length<1){
                        res.sendStatus(400);
                        return;
                    }

                    var response = [];

                    for (i in rowsC){
                        response.push({date: rowsA[i].date, address: rowsB[i].address_no+ " "+ rowsB[i].address_street + " " + rowsB[i].address_suburb + " " + rowsB[i].address_state + " " + rowsB[i].address_postcode, hotspot:rowsC[i].hotspot, business_name: rowsC[i].business_name});
                    }

                    console.log(response);


                    res.status(200).json(response);

                });



            });
        });
        connection.release();
    });
});


// GET current-hotspots
router.get('/current-hotspots', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/current-hotspots.html'));
});

router.get('/current-hotspots/data', function(req, res){

    req.pool.getConnection(function(err,connection){
        if (err){
            res.sendStatus(500);
            return;
        }

        var query = "SELECT address_no, address_street, address_suburb, address_state, address_postcode FROM business_address "+
                    "INNER JOIN businesses on business_address.id = businesses.code " +
                    "WHERE businesses.hotspot=true;";
        connection.query(query, function(err, rowsA, fields){
            if (err){
                res.sendStatus(500);
                return;
            }

            query="SELECT business_name FROM businesses WHERE hotspot=true";

            connection.query(query, function(err, rowsB, fields){
                if (err){
                    res.sendStatus(500);
                    return;
                }

                response=[];

                for (i in rowsA){
                    response.push({name: rowsB[i].business_name,address: rowsA[i].address_no+ " "+ rowsA[i].address_street + " " + rowsA[i].address_suburb + " " + rowsA[i].address_state + " " + rowsA[i].address_postcode })
                }

                console.log(response);

                console.log(rowsA);
                console.log(rowsB);

                res.status(200).json(response);


            });

            connection.release();

        });

    });

});

module.exports = router;
