var Advisor = require('../models/Advisor');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var twilio = require('twilio');
var client = new twilio.RestClient(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
var codes = {};
var advisors = {};

function generateToken(user) {
    var payload = {
        iss: 'my.domain.com',
        sub: user.id,
        iat: moment().unix(),
        exp: moment().add(7, 'days').unix()
    };
    return jwt.sign(payload, process.env.TOKEN_SECRET);
}

function phoneCall(phone, code) {
    client.makeCall({

        to: phone, // Any number Twilio can call
        from: '+16473609623',
        url: 'https://consilium-marceloneil.c9users.io/voice/' + code // A URL that produces an XML document (TwiML) which contains instructions for the call

    }, function(err, responseData) {

        //executed when the call has been initiated.
        console.log(err);
        console.log(responseData.from); // outputs "+14506667788"

    });
}


/**
 * POST /signup
 */
exports.addAdvisor = function(req, res, next) {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.assert('phone', 'Phone Number cannot be blank').notEmpty();
    req.assert('firm', 'Firm cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({
        remove_dots: false
    });

    var errors = req.validationErrors();

    if (errors) {
        return res.status(400).send(errors);
    }

    Advisor.findOne({
        email: req.body.email
    }, function(err, advisor) {
        if (advisor) {
            return res.status(400).send({
                msg: 'The email address you have entered is already associated with another account.'
            });
        }
        advisor = new Advisor({
            name: req.body.name,
            email: req.body.email,
            website: req.body.website,
            picture: req.body.picture,
            facebook: req.body.facebook,
            twitter: req.body.twitter,
            linkedin: req.body.linkedin,
            address: req.body.address,
            phone: req.body.phone,
            firm: req.body.firm,
            designation: req.body.designation,
            ratings: req.body.ratings
        });
        advisor.save(function(err) {
            res.send({
                token: generateToken(advisor),
                advisor: advisor
            });
        });
    });
};

exports.getAdvisor = function(req, res, next) {
    Advisor.find({}, function(err, advisors) {
        res.send(advisors);
    })
};

exports.claimAdvisor1 = function(req, res, next) {
    Advisor.findById(req.body.advisor.id, function(err, advisor) {
        if (!advisor) {
            return res.status(400).send({
                msg: 'The advisor you were claiming does not exist'
            });
        }
        var phone = '+1' + advisor.phone.replace(/\D/g, '');
        var code = Math.floor(Math.random() * 1000000).toString();
        var pad = "000000"
        code = pad.substring(0, pad.length - code.length) + code;
        codes[req.body.user.id] = code;
        advisors[req.body.user.id] = req.body.advisor.id;
        makeCall(phone, code);
        res.send("good shit");
    });
}

exports.claimAdvisor2 = function(req, res, next) {
    if (req.body.code == codes[req.body.user.id]) {
        User.findById(req.body.user.id, function(err, user) {
            user.advisor = advisors[req.body.user.id];
            user.save(function(err) {
                res.send({
                    msg: 'You have claimed your advisor position'
                });
            });
        });
    }
    else {
        res.send("Wrong Code")
    }
    codes[req.body.user.id] = null;
    advisors[req.body.user.id] = null;
}

exports.addReview = function(req, res, next) {
    Advisor.findById(req.body.advisor.id, function(err, advisor) {
        advisor.ratings.push({
            user: req.body.user.id,
            rating: req.body.rating,
            comment: req.body.comment
        })
        advisor.save(function(err) {
            res.send({
                msg: 'You have rated the advisor'
            });
        });
    });
}

exports.voice = function(request, response) {
    // Use the Twilio Node.js SDK to build an XML response
    var twiml = new twilio.TwimlResponse();

    twiml.say('Please enter the code: ' + request.params.code.split("").join(". ") + ". I will repeat: " + request.params.code.split("").join(". "));

    // Render the response as XML in reply to the webhook request
    response.type('text/xml');
    console.log(twiml.toString());
    response.send(twiml.toString());
};
