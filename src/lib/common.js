var http = require('http')
    , request = require('request')
    , headers = {'accept':'application/json'};

var jar = request.jar();
exports.request = request;
exports.jar = jar;
exports.headers =   {'accept':'application/json'};


// Common Functions
exports.makeCall = function(url, callback){
    request.get({url:url,jar:jar,headers:headers},function (error, response, body) {
        if (!error && response.statusCode == 200){
            try{
                callback(JSON.parse(body));
            }
            catch(error)
            {
                console.log('Error parsing JSON: ' + error);
            }

        }
        else
        {
            console.log(response.statusCode);
            console.log(error);
        }
    });

}