#!/usr/bin/env node
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var bodyParser = require("body-parser");
var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var R = require("r-script");

var url='mongodb://localhost';
var ObjectID = require('mongodb').ObjectID;
var player1, player2, age1, age2, prob1, prob2;

var players = [{$find:{id:1, lastname:"Nadal", firstname:1, birthdate:1}}];

app.get('/stats/:id1',function(req,res){
    MongoClient.connect(url, function (err, client) {
        if (err) {
            if (err) {
                res.write("Failed, Error while connecting to Database");
                res.end();
            }
        }
        var tennisDB = client.db('tennis');
        var tempJson = {};
        var age = 0;
        var id1 = req.params.id1-0;
        var playerJson = {};

        tennisDB.collection('ranks').find({"id": id1}).sort({"date": -1}).limit(1).toArray(function (err, result) {
            console.log(JSON.stringify(result));
            result.forEach(function (item) {
                if (item.id === id1) {
                    tempJson = item;
                }
            });
            tennisDB.collection('players').find({"id":id1}).limit(1).toArray(function(err,result1){
                result1.forEach(function (item) {
                    if (item.id === id1) {
                        age = CalcAge(item.birthdate);
                    }
                });

                if(tempJson.rank===null)tempJason.rank = 0;
                if(tempJson.rankpts===null)tempJson.rankpts = 0;

                playerJson = {"rank":tempJson.rank,"age":age,"rankpts":tempJson.rankpts};
                res.send(playerJson);

            });
        });



    });
});

app.post('/calculate', function(req,res){
   var players = req.body;

   predict(players,res);
});

app.get('/compare/:id1/:id2', function (req, res) {

    var id1 = req.params.id1-0;
    var id2 = req.params.id2-0;

    MongoClient.connect(url, function (err, client) {
        if (err) {
            if (err) {
                res.write("Failed, Error while connecting to Database");
                res.end();
            }
        }
        var tennisDB = client.db('tennis');

        tennisDB.collection('players').find({"id": {$in: [id1, id2]}}).toArray(function (err, result) {
            if (err) {
                res.write("get Failed");
                res.end();
            } else {
                console.log(JSON.stringify(result));

                var player1 = {};
                result.forEach(function (item) {
                    if (item.id === id1) {
                        player1 = item;
                    }
                });
                var player2 = {};
                result.forEach(function (item) {
                    if (item.id === id2) {
                        player2 = item;
                    }
                });

                tennisDB.collection('ranks').find({"id": player1.id}).sort({"date": -1}).limit(1).toArray(function (err, result1) {
                    console.log(JSON.stringify(result));
                    callback1(result1, result[0]);
                });

                tennisDB.collection('ranks').find({"id": player2.id}).sort({"date": -1}).limit(1).toArray(function (err, result1) {
                    callback2(result1, result[1], res);
                });

                //console.log(JSON.stringify(player1));
                //console.log(result[0].id);
                //console.log(res.)
                //res.send(JSON.stringify(result));
            }
            console.log("Got All Documents");
        });
    });
});

function callback1(json,json2){
    player1 = json[0];
    console.log(JSON.stringify(player1));
    age1 = CalcAge(json2.birthdate);
    console.log(age1);
}

function callback2(json,json2,res){
    player2 = json[0];
    console.log(JSON.stringify(player2));
    age2 = CalcAge(json2.birthdate);
    console.log(age2);
    compute(res)
}

function compute(res){
    player1 = {"rank":player1.rank,"rankDif":player1.rank-player2.rank,"age":age1,"rankpts":player1.rankpts,"rankPtDif":player1.rankpts-player2.rankpts};
    player2 = {"rank":player2.rank,"rankDif":player2.rank-player1.rank,"age":age2,"rankpts":player2.rankpts,"rankPtDif":player2.rankpts-player1.rankpts};
    (predict([player1,player2],res));
}

function predict(tennis,res){

    console.log(JSON.stringify(tennis));

    R("C:\\Users\\Dave\\Documents\\GitHub\\CSS5590_490_web_mobile\\ICP_6\\MEAN_Stack_App\\example\\predict.R")
        .data({df: tennis})
        .call(function(err,d){
            if(err) throw err;
            res.send(d);
            prob1 = d[0];
            prob2 = d[1];
            console.log(prob1);
            console.log(prob2);
        });
}

function CalcAge(birthdate) {
    var birth = birthdate.toString();
    var today = new Date();
    var bDate = new Date(birth.substr(0,4)-0, birth.substr(4,2)-1, birth.substr(6,2)-0);

    var nextBirthDay = new Date(today.getFullYear() + 1, bDate.getMonth(), bDate.getDate());
    var thisBirthDay = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
    var daysInBirthYear = ((nextBirthDay - thisBirthDay) / 1000 / 60 / 60 / 24);

    var todayInBirthYear = ((today - thisBirthDay) / 1000 / 60 / 60 / 24);

    var ageMod = 0;
    if (thisBirthDay > today) {
        ageMod = -1;
    }

    var dateAge = todayInBirthYear / daysInBirthYear;
    var age = today.getFullYear() - bDate.getFullYear() - ageMod + dateAge;
    age = Math.round(age*100)/100;
    return age;
}

app.get('/get', function (req, res) {

    MongoClient.connect(url, function (err, client) {
        if (err) {
            if (err) {
                res.write("Failed, Error while connecting to Database");
                res.end();
            }
        }
        var tennisDB = client.db('tennis');

        tennisDB.collection('players').find().toArray(function(err, result) {
            if (err) {
                res.write("get Failed");
                res.end();
            } else {

                res.send(JSON.stringify(result));
            }
            console.log("Got All Documents");
        });
    });
});

app.get('/players1/:lastname/:firstname', function (req, res) {

    var lastQ = {"lastname":req.params.lastname,"firstname":req.params.firstname};
    console.log(JSON.stringify(lastQ));

    MongoClient.connect(url, function (err, client) {
        if (err) {
            if (err) {
                res.write("Failed, Error while connecting to Database");
                res.end();
            }
        }
        var tennisDB = client.db('tennis');

        tennisDB.collection('players').find(lastQ).toArray(function(err, result) {
            if (err) {
                res.write("get Failed");
                res.end();
            } else {

                res.send(JSON.stringify(result));
            }
            console.log("Got All Documents");
        });
    });
});

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port)
});