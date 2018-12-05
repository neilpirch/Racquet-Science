var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var bodyParser = require("body-parser");
var express = require('express');
var cors = require('cors');
var app = express();

var url='mongodb://localhost/tennis_atp';//1.Modify this url with the credentials of your db name and password.
var dbo = db.db("tennis_atp");
var ObjectID = require('mongodb').ObjectID;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect(url, function(err, db) {
    if(err)
    {
        res.write("Failed, Error while connecting to Database");
        res.end();
    }
    var query = req.query;
    console.log(query);

    dbo.collection('atp_players').find().toArray(function(err, result){
        if(err)
        {
            res.write("get Failed");
            res.end();
        }else
        {
            console.log(res);
            res.send(JSON.stringify(result));
        }
        console.log("Got All Documents");
    });
});
app.get('/list', function (req, res) {
    MongoClient.connect(url, function(err, db) {
        if(err)
        {
            res.write("Failed, Error while connecting to Database");
            res.end();
        }
        var query = req.query;
        console.log(query);

        db.collection('atp_players').find().toArray(function(err, result){
            if(err)
            {
                res.write("get Failed");
                res.end();
            }else
            {
                console.log(res);
                res.send(JSON.stringify(result));
            }
            console.log("Got All Documents");
        });
    });

});

app.post('/create', function (req, res) {
    MongoClient.connect(url, function(err, db) {
        if(err)
        {
            res.write("Failed, Error while connecting to Database");
            res.end();
        }
        insertDocument(db, req.body, function() {
            res.write("Successfully inserted");
            res.end();
        });
    });
});

app.get('/get', function (req, res) {
    MongoClient.connect(url, function(err, db) {
        if(err)
        {
            res.write("Failed, Error while connecting to Database");
            res.end();
        }

        db.collection('atp_matches').find().toArray(function(err, result){
            if(err)
            {
                res.write("get Failed");
                res.end();
            }else
            {

                res.send(JSON.stringify(result));
            }
            console.log("Got All Matches");

        });
    });

});

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port)
});