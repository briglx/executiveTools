var http = require('http')
    , common = require('../../lib/common.js')
    , nconf = require('nconf');

/*
 * GET home page.
 */

exports.index = function (req, res) {

    res.render('index', { title: 'Express', user: req.session.user});
};

exports.template = function (req, res) {
    res.render('template', { title: 'Express', user: req.session.user});
};

exports.refresh = function (req, res) {

    // Get Unit No
    var user = req.session.user;

    console.log("Get Recommend Status");

    if (user.permissions.loggedIn) {

        var url = nconf.get('ldstools:recommendStatus') + '?unitNumber=' + user.homeUnitNbr + '&lang=eng'

        var recommends = [];
        common.makeCall(url, function (body) {

            var recommend = {};
            for (var i = 0; i < body.length; i++) {
                recommend = {
                    individualId: body[i].id,
                    name: body[i].name,
                    email: body[i].email,
                    status: body[i].status,
                    recommendStatus: body[i].recommendStatus,
                    title: (function () {
                        if (body[i].gender == "MALE") {
                            return "Bro.";
                        }
                        else {
                            return "Sis.";
                        }
                    }()),
                    lastname: (function () {
                        n = body[i].name.split(",");
                        return n[0];
                    }()),
                    message: (function () {
                        switch (body[i].recommendStatus) {
                            case "EXPIRED_OVER_3_MONTHS":
                                return "is three or more months expired";
                                break;
                            case "EXPIRED_LESS_THAN_3_MONTHS":
                                return "has expired";
                                break;
                            case "EXPIRED_LESS_THAN_1_MONTH":
                                return "has expired";
                                break;
                            case "EXPIRING_THIS_MONTH":
                                return "will expire this month";
                                break;
                            case "EXPIRING_NEXT_MONTH":
                                return "will expire next month";
                                break;
                            case "ACTIVE":
                                break;
                        }

                    }())
                };

                recommends.push(recommend);

            }

            res.json(recommends);

        });

    }
    else {

        res.status(403);
        res.json({message: "please log in"});

    }
};


