//Setting up tools
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
let mysql = require('mysql2');

const app = express();
const path = require('path');

app.use(cors())
app.use(bodyParser.json())
app.use(express.static(__dirname));



//Global variables to make modifications easier
let usr = "IntrixTheName", pwd = "Foxtrot492";
let main_file = "webpages/library-view.html";



//Create initial connection to database
let con = mysql.createConnection({
    host: "localhost",
    user: usr,
    password: pwd,
    database: "music_library"
});

//Initial test of connection
con.connect(function(err) {
    if(err) throw err;
    console.log("Connected to database");
});

let url = require('url'); //Why is this line here?



//Send the login screen (aka the screen when someone first connects)
app.get('/', (routeRequest, routeResult) => {
    routeResult.sendFile(path.join(__dirname, main_file));
});

app.get('/export-preset', (routeRequest, routeResult) => {
    routeResult.sendFile(path.join(__dirname, "webpages/export-preset.html"));
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



//For handling login, changes user on the database connection
app.get('/login/:usr/:pwd', (routeRequest, routeResult) => {
    //Sort the information
    let usr = routeRequest.params.usr;
    let pwd = routeRequest.params.pwd;

    console.log(`Setting "${usr}" as user`);

    //Change the user
    con.changeUser({
        user: usr,
        password: pwd
    })

    //Send back a message
    routeResult.json({
        message: "Active user changed successfully",
        user: usr
    })
})



//For getting config/presets from database
app.get('/get-export-settings', (routeRequest, routeResult) => {
    console.log("Reading export settings from database");
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        let query = "SELECT * from config";
        console.log(query);

        con.query(query, function(err, queryResult, fields) {
            if (err) throw err;
            console.log(queryResult);
            routeResult.json(queryResult);
        })
    })
})



//Get song inforation from database
app.get('/song-information', (routeRequest, routeResult) => {
    console.log("Getting song information from database")
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        let query = "SELECT song_id, title, artist FROM song_info";
        console.log(query);

        con.query(query, function(err, queryResult, fields) {
            if (err) throw err;
            console.log(queryResult);
            routeResult.json(queryResult);
        })
    })
})



//Start the server and listen
app.listen(2492, () => {
    console.log('Server is listening on port 2492');
});