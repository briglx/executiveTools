var MongoClient = require('mongodb').MongoClient;


exports.getActivities = function(req, res) {

    var individualId = parseInt(req.param('id', null));

    try {
        MongoClient.connect('mongodb://127.0.0.1:27017/executive', function (err, db) {
            if (err) {
                console.log("error getting activities. Can't connect to database." + err);
                res.status(503);
                res.json({message: "error getting activity."});
            }
            else {

                var collection = db.collection('activities');
                collection.find({"individualId": individualId}).toArray(function(err, results) {
                    res.json(results);
                    db.close();
                });
            }
        });
    }
    catch (err) {
        console.log("error getting activities. " + err);
        res.status(503);
        res.json({message: "error getting activities."});
    }


};

exports.addActivity = function (req, res) {

    var activity = req.body;

    try {
        MongoClient.connect('mongodb://127.0.0.1:27017/executive', function (err, db) {
            if (err) {
                console.log("error saving activity. Can't connect to database." + err);
                res.status(503);
                res.json({message: "error saving activity. Can't connect to database."});
            }
            else {

                var collection = db.collection('activities');
                collection.insert(activity, function (err, docs) {

                    if (err) {
                        console.log("error saving activity. Can't insert to database." + err);
                        res.status(503);
                        res.json({message: "error saving activity."});
                    }

                    // Return doc
                    res.json({message: docs});

                    db.close();

                });
            }
        });
    }
    catch (err) {
        console.log("error saving activity. " + err);
        res.status(503);
        res.json({message: "error saving activity."});
    }

};