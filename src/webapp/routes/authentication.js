var http = require('http')
    , common = require('../../lib/common.js');

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

//        getUnitNo(function(unitNo){
//            console.log(unitNo);
//            //res.json({"message":unitNo});
//
//        });

        // Success


    }, function(){

        res.status(503);
        res.json({"message":"Failed to login to LDS account"});

    });

//    request.post({url:url, form:form, jar:jar},function (error, response, body) {
//        if (!error && response.statusCode == 200) {
//            console.log(response.headers);
//            console.log(body) // Print the google web page.
//            loggedOn = true;
//
//            res.json({"message":"ok"});
//        }
//        else
//        {
//
//
//            res.status(503);
//            res.json({"message":error});
//        }
//    });
};



function ldsLogin(form, next, err){
    console.log("login");

    //var url='https://signin.lds.org/login.html';
    var url='http://localhost:3000/mock/login';

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
            err();
        }
    });
}


function getUserDetails(next){

    // Get Unit Number
    console.log("Get Current User Detail");
    //url='https://www.lds.org/mobiledirectory/services/v2/ldstools/current-user-detail';
    url='http://localhost:3000/mock/userDetails';

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
    //url='https://www.lds.org/mobiledirectory/services/ludrs/1.1/mem/mobile/current-user-unitNo';
    url='http://localhost:3000/mock/userUnit';
    common.makeCall(url, function(body){
        console.log(body.message);
        unitNo=body.message;
        if(next){
            next(unitNo);
        }

    });
};


