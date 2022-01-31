var express = require('express');
const path = require('path');
var router = express.Router();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const createDOMPurify = require('dompurify');

var ssn;

router.use(function (req, res, next) {
    ssn = req.session;
    var uid = ssn.uid;
    var query = "SELECT business_owner, health_official FROM users WHERE user_id = ?";

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
            if(rows[0].business_owner == true || rows[0].health_official == true) {
                next();
                return;
            }
            else {
                res.sendStatus(401);
            }
        });
    });
});

/* GET home page for manage-business. */
router.get('/', function(req, res) {

    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);

    if (req.get('Content-Type') == 'application/json') {
        ssn=req.session;
        var uid=ssn.uid;
        var query = "SELECT business_name, code FROM businesses WHERE owner_id = ?";
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

                var i;
                var businesses = [];
                // console.log(businesses);
                for (i = 0; i < rows.length; i++) {
                    businesses.push({business_name: DOMPurify.sanitize(rows[i].business_name), code: DOMPurify.sanitize(rows[i].code)});
                }
                // var businesses = {business_name: rows[0].business_name, code: rows[0].code};
                res.json(businesses);
                return;
            });
        });
    } else {
        res.sendFile(path.join(__dirname, '../public/manage-business.html'));
    }
});

router.post('/business_alt', function(req,res){
    console.log("zoo wee a");
    var alternate = req.body.business_alt;
    ssn=req.session;
    console.log(alternate);


    req.pool.getConnection(function(err,connection){
       if (err) {
           console.log("zoo wee a");
            res.sendStatus(500);
            return;
        }
        var query="SELECT code FROM businesses WHERE code=?";
        connection.query(query, [alternate], function(err, rows, fields){
            if (err) {
            res.sendStatus(500);
            return;
            }
            if (rows.length<1){
                res.sendStatus(400);
                return;
            }
            ssn.business_alt=rows[0].code;
            console.log(ssn.business_alt);
            res.sendStatus(200);

            return;

        });
        connection.release();

    });
});

/* GET page for business-details */

router.get('/business-details', function(req, res) {
    req.pool.getConnection(function(err,connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
    });
    res.sendFile(path.join(__dirname, '../public/business-details.html'));
});

router.get('/business-details/details', function(req, res) {

    ssn=req.session;
    // var uid = ssn.uid;
    var code; // = ssn.bid;


    console.log(ssn.business_alt);
    if (ssn.business_alt===null ||ssn.business_alt ===  undefined){
        code = ssn.bid;
    }
    else {
        code=ssn.business_alt;
        ssn.business_alt=null;
        console.log(ssn.business_alt);
    }

    if(!code) {
        res.sendStatus(403);
        return;
    }

    req.pool.getConnection(function(err,connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = "SELECT business_email, business_name, phone_number, industry, persons_capacity FROM businesses WHERE code = ?";
        connection.query(query,[code], function(err, rowsB, fields) {
            if(err) {
                res.sendStatus(500);
                return;
            }
            if(rowsB.length < 1) {
                res.sendStatus(403);
                return;
            }
            query = "SELECT address_no, address_street, address_suburb, address_state, address_postcode FROM business_address WHERE id = ?";
            connection.query(query,[code], function(err, rowsA, fields) {
                if(err) {
                    res.sendStatus(500);
                    return;
                }
                if(rowsA.length < 1) {
                    res.sendStatus(500);
                    return;
                }
                var businessInformation = {email: rowsB[0].business_email, name: rowsB[0].business_name, number: rowsB[0].phone_number, industry: rowsB[0].industry, capacity: rowsB[0].persons_capacity,
                                           address_no: rowsA[0].address_no, address_street: rowsA[0].address_street, address_suburb: rowsA[0].address_suburb, address_state: rowsA[0].address_state,
                                           address_postcode: rowsA[0].address_postcode};

                console.log(businessInformation);
                res.json(businessInformation);
            });
        });
        connection.release();
    });
});

/* POST page for business-details */

router.post('/business-details', function(req, res) {
    ssn=req.session;
    var uid = ssn.uid;
    var code;

    var business = req.body;
    var query;



    console.log(ssn.business_alt);
    if (ssn.business_alt===null ||ssn.business_alt ===  undefined){
        code = ssn.bid;
    }
    else {
        code=ssn.business_alt;
        ssn.business_alt=null;
        console.log(ssn.business_alt);
    }

    console.log(code);
    console.log(business);

    var name = business.business_name;
    var industry = business.industry;
    var email = business.business_email;
    var phone = business.phone_number;

    var street_no = business.address_no;
    var street_name = business.address_street;
    var suburb = business.address_suburb;
    var state = business.address_state;
    var postcode = business.address_postcode;

    var capacity = parseInt(business.persons_capacity);

    if(name && industry && email && phone && street_no && street_name && suburb && state && postcode && capacity && code) {
        req.pool.getConnection(function(err,connection) {
            if (err) {
                res.sendStatus(500);
                return;
            }

            query = "SELECT code FROM businesses WHERE code = ?";

            connection.query(query,[code], function(err, rows, fields) {
                if(err) {
                    console.log("Error finding code in businesses.");
                    res.sendStatus(500);
                    return;
                }

                if(rows.length < 1) {
                    res.sendStatus(401);
                    return;
                }

                // We tried to use multiple statements here to ensure if a row was inserted into businesses a row was also inserted into business_address, however, due to how express server is configured we were unable to get this working.

                query = "UPDATE businesses SET business_name = ?, business_email = ?, phone_number = ?, industry = ?, persons_capacity = ? WHERE code = ?";

                connection.query(query,[name, email, phone, industry, capacity, code], function(err, rows, fields) {
                    if(err) {
                        console.log(err);
                        console.log("Error inserting into businesses.");
                        res.sendStatus(500);
                        return;
                    }

                    query = "UPDATE business_address SET address_no = ?, address_street = ?, address_suburb = ?, address_state = ?, address_postcode = ? WHERE id = ?";
                    connection.query(query,[street_no, street_name, suburb, state, postcode, code], function(err, rows, fields) {
                        if(err) {
                            console.log("Error inserting into business_address.");
                            res.sendStatus(500);
                            return;
                        }
                        res.sendStatus(200);
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

router.post('/business-details/code', function(req, res){
    var code=req.body.code;
    ssn=req.session;
    if(!code) {
        res.sendStatus(403);
        return;
    }
    ssn.bid = code;
    res.sendStatus(200);
});



/* GET home page for manage-business. */
router.get('/check-in-history', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/b-check-in-history.html'));
});

router.get('/check-in-history/history', function(req,res) {
    ssn=req.session;
    var code; // = ssn.bid;


    console.log(ssn.business_alt);
    if (ssn.business_alt===null ||ssn.business_alt ===  undefined){
        code = ssn.bid;
    }
    else {
        code=ssn.business_alt;
        ssn.business_alt=null;
        console.log(ssn.business_alt);
    }

    if(!code) {
        res.sendStatus(403);
        return;
    }

    req.pool.getConnection(function(err,connection) {
        if(err) {
            res.sendStatus(500);
            return;
        }

        query = "SELECT businesses.business_name FROM businesses WHERE businesses.code = ?";
        connection.query(query,[code], function(err, rowsB, fields) {
            if(err) {
                console.log(err);
                res.sendStatus(500);
                return;
            }
            if(rowsB.length < 1) {
                res.sendStatus(500);
            }

            var query = "SELECT business_checkin_history.date FROM business_checkin_history WHERE business_checkin_history.id = ?";
            connection.query(query,[code], function(err, rowsC, fields) {
                if(err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }
                var history = {name: rowsB[0].business_name, dates: []};
                if(rowsC.length < 1) {
                    res.status(200).json(history);
                    return;
                }
                var i;
                for(i=0;i<rowsC.length;i++) {
                    history.dates.push(rowsC[i].date);
                }
                console.log(history);
                res.json(history);
            });
        });
    connection.release();
    });
});

router.post('/check-in-history/code', function(req, res){
    var code=req.body.code;
    console.log(code);
    if(!code) {
        res.sendStatus(403);
        return;
    }

});

module.exports = router;
