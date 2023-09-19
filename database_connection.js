//Setting up tools
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
var mysql = require('mysql2');

const app = express();
const path = require('path');

app.use(cors())
app.use(bodyParser.json())



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

app.get('/login', (routeRequest, routeResult) => {

})


//Start the server and listen
app.listen(2492, () => {
    console.log('Server is listening on port 2492');
});