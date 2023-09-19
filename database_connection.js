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

con.connect(function(err) {
    if(err) throw err;
    console.log("Connected to database");
});

var url = require('url'); //Why is this line here?

app.get('/connection-test', (routeRequest, routeResult) => {
    routeResult.json({
      message: 'database_connection.js responded'
    });
})

app.get('/', (routeRequest, routeResult) => {
    routeResult.sendFile(path.join(__dirname, main_file));
});

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

app.get('/login', (routeRequest, routeResult) => {

})


//Start the server and listen
app.listen(2492, () => {
    console.log('Server is listening on port 2492');
});