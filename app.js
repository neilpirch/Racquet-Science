#!/usr/bin/env node
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var bodyParser = require("body-parser");
var express = require('express');
//var cors = require('cors');
var app = express();

//app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//var R = require("r-script");

var url='mongodb://localhost';
var ObjectID = require('mongodb').ObjectID;
var player1, player2, age1, age2, prob1, prob2;

var players = [{$find:{id:1, lastname:"Nadal", firstname:1, birthdate:1}}];

MongoClient.connect(url, function(err, client) {
    if(err)
    {

    }

    var db = client.db('tennis');

    db.collection('players').find({"id":{$in:[103819,104745]}}).toArray(function(err, result){
        if(err)
        {

        }else
        {
            console.log(JSON.stringify(result));


            db.collection('ranks').find({"id":result[0].id}).sort({"date":-1}).limit(1).toArray(function(err, result1){
                callback1(result1,result[0]);
            });

            db.collection('ranks').find({"id":result[1].id}).sort({"date":-1}).limit(1).toArray(function(err, result1){
                callback2(result1,result[1]);
            });

            //console.log(JSON.stringify(player1));
            //console.log(result[0].id);
            //console.log(res.)
            //res.send(JSON.stringify(result));
        }
        console.log("Got All Documents");

    });
});

function callback1(json,json2){
    player1 = json[0];
    console.log(JSON.stringify(player1));
    age1 = CalcAge(json2.birthdate);
    console.log(age1);
}

function callback2(json,json2){
    player2 = json[0];
    console.log(JSON.stringify(player2));
    age2 = CalcAge(json2.birthdate);
    console.log(age2);
    compute()
}

function compute(){
    player1 = {"rank":player1.rank,"rankDif":player1.rank-player2.rank,"age":age1,"rankpts":player1.rankpts,"rankPtDif":player1.rankpts-player2.rankpts};
    player2 = {"rank":player2.rank,"rankDif":player2.rank-player1.rank,"age":age2,"rankpts":player2.rankpts,"rankPtDif":player2.rankpts-player1.rankpts};
    predict([player1,player2]);
}

function predict(tennis){
    var R = require("r-script");

    R("E:\\Documents\\GitHub\\tennis_atp_web\\example\\predict.R")
        .data({df: player1})
        .call(function(err,d){
            if(err) throw err;
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
    return age;
}

app.get('/get', function (req, res) {
    MongoClient.connect(url, function(err, db) {
        if(err)
        {
            res.write("Failed, Error while connecting to Database");
            res.end();
        }

        db.collection('books').find().toArray(function(err, result){
            if(err)
            {
                res.write("get Failed");
                res.end();
            }else
            {

                res.send(JSON.stringify(result));
            }
            console.log("Got All Documents");

        });
    });

});
