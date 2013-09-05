var http = require('http')
    , common = require('../../lib/common.js')
    , nconf = require('nconf');

exports.login = function(req, res) {
    console.log('In login');

    var form={username:req.body.username, password:req.body.password};

    ldsLogin(form, function(){

        getUserDetails(function(user) {
            console.log(user.individualId);
            req.session.user = {
                individualId: user.individualId,
                homeUnitNbr: user.homeUnitNbr,
                permissions: {
                    loggedIn: true
                }
            } ;

            res.json({"individualId": user.individualId});
        });

    }, function(){

        res.status(503);
        res.json({"message":"Failed to login to LDS account"});

    });

};



function ldsLogin(form, next, err){
    console.log("login");

    var url=nconf.get('ldstools:loginUrl');

    common.request.post({url:url, form:form, jar:common.jar},function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body) // Print the google web page.
            if(next){
                next();
                return true;
            }
        }
        else
        {
            console.log('LdsLogin failed: ' + error);

            err(error);
        }
    });
}


function getUserDetails(next){

    // Get Unit Number
    console.log("Get Current User Detail");
    url=nconf.get('ldstools:currentUserUrl');

    common.makeCall(url, function(body){
        console.log(body);
        if(next){
            next(body);
        }

    });
};

function getUnitNo(next){

    // Get Unit Number
    console.log("Get Unit Number");
    url=nconf.get('ldstools:unitNo');
    common.makeCall(url, function(body){
        console.log(body.message);
        unitNo=body.message;
        if(next){
            next(unitNo);
        }

    });
};


