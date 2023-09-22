//Setting up tools
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
var mysql = require('mysql2');

const app = express();
const path = require('path');

app.use(cors())
app.use(bodyParser.json())
app.use(express.static(__dirname));



let main_file = "sample-website.html";
let username = "IntrixTheName";
let pwd = "Foxtrot492";

var con = mysql.createConnection({
    host: "localhost",
    user: username,
    password: pwd,
    database: "music_library"
});

//Initial test of connection
con.connect(function(err) {
    if(err) throw err;
    console.log("Connected to database");
});

var url = require('url'); //Why is this line here?



//Send the login screen (aka the screen when someone first connects)
app.get('/', (routeRequest, routeResult) => {
    routeResult.sendFile(path.join(__dirname, main_file));
});



//Manually check connection from web server to this file
app.get('/connection-test', (routeRequest, routeResult) => {
    routeResult.json({
      message: 'database_connection.js responded'
    });
})



//Retreive all users from the database (used to populate dropdown on login screen)
app.get('/get-users', (routeRequest, routeResult) => {
    console.log("Reading users from database");
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        let query = "SELECT name FROM user;";
        console.log(query);

        con.query(query, function(err, queryResult, fields) {
            if (err) throw err;
            console.log(queryResult);
            routeResult.json(queryResult);
        })
    })
})



//For handling login? May be removed in the near future
app.get('/login', (routeRequest, routeResult) => {

})


//Start the server and listen
app.listen(2492, () => {
    console.log('Server is listening on port 2492');
});