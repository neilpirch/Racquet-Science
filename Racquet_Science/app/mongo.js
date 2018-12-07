/*
* Javascript to drive connections to the database and R
*
* Coded for UMKC-APL Web/Mobile Programming class
* David Walsh 2018
*
 */
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require("body-parser");
var express = require('express');
var cors = require('cors');
var app = express();
var R = require("r-script");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var url='mongodb://localhost';
var player1, player2, age1, age2, prob1, prob2;

//var players = [{$find:{id:1, lastname:"Nadal", firstname:1, birthdate:1}}];

//Call on the database to retrieve player stats
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
        var id1 = req.params.id1-0; //convert the string id to integer
        var playerJson = {};

        //Get the players stats from the ranks database: Rank, and RankPoints
        tennisDB.collection('ranks').find({"id": id1}).sort({"date": -1}).limit(1).toArray(function (err, result) {
            console.log(JSON.stringify(result));
            result.forEach(function (item) {
                if (item.id === id1) {
                    tempJson = item;
                }
            });
            //Get the birthday of the player
            tennisDB.collection('players').find({"id":id1}).limit(1).toArray(function(err,result1){
                result1.forEach(function (item) {
                    if (item.id === id1) {
                        age = CalcAge(item.birthdate); //calculate the current age of the player
                    }
                });

                if(tempJson.rank===null)tempJason.rank = 0; //error correction if nulls returned
                if(tempJson.rankpts===null)tempJson.rankpts = 0; //error correction if nulls returned

                //Compile the new json and return it
                playerJson = {"rank":tempJson.rank,"age":age,"rankpts":tempJson.rankpts};
                res.send(playerJson);

            });
        });
    });
});

//Recieve a formatted JSON to send to R for prediction
app.post('/calculate', function(req,res){
    var players = req.body;

    predict(players,res);
});

//Process a JSON to return a probability of winning
function predict(tennis,res){

    console.log(JSON.stringify(tennis));

    //Using an R connection created via the r-script library,
    //send the JSON to be received as a data.frame for processing.
    R("D:\\Users\\neilp\\Documents\\GitHub\\tennis_atp\\predict.R")
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

    //Convert the birthdate to a string and subsequently to a Date object
    var birth = birthdate.toString();
    var today = new Date();
    var bDate = new Date(birth.substr(0,4)-0, birth.substr(4,2)-1, birth.substr(6,2)-0);

    //Consider a year to be from birthday to birthday, and get the number of days in one year for that year
    var nextBirthDay = new Date(today.getFullYear() + 1, bDate.getMonth(), bDate.getDate());
    var thisBirthDay = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
    var daysInBirthYear = ((nextBirthDay - thisBirthDay) / 1000 / 60 / 60 / 24);

    //Calculate what number day of the year it is in reference to the birthday
    var todayInBirthYear = ((today - thisBirthDay) / 1000 / 60 / 60 / 24);

    //Subtract a modifier if the birthday has not yet happened in the calendar year
    var ageMod = 0;
    if (thisBirthDay > today) {
        ageMod = -1;
    }

    //Calculate the percent of the birth year that has passed.
    var dateAge = todayInBirthYear / daysInBirthYear;

    //Calculate the age and round to two decimal places
    var age = today.getFullYear() - bDate.getFullYear() - ageMod + dateAge;
    age = Math.round(age*100)/100;
    return age;
}

//Retrieve the full list of players and their ids from the database
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

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port)
});