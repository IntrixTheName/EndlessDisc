var mysql = require('mysql2');

let username = "IntrixTheName";
let pwd = prompt("Enter MySQL password for " + username);

var con = mysql.createConnection({
    host: "localhost",
    user: username,
    password: pwd,
    database: music-library
});

con.connect(function(err) {
    if(err) throw err;
    console.log("Connected");
});