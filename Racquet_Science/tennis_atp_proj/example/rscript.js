#!/usr/bin/env node
var R = require("r-script");

var attitude = JSON.parse(
    require("fs").readFileSync("example/data.json", "utf8"));



R("C:\\Users\\Dave\\Documents\\GitHub\\CSS5590_490_web_mobile\\ICP_6\\MEAN_Stack_App\\example\\tennis.R")
    .data({df: attitude})
    .call(function(err, d) {
        if (err) throw err;
        console.log(d[0]);
    });