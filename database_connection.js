//Setting up tools
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');

app.use(cors())
app.use(bodyParser.json())

var mysql = require('mysql2');



let username = "IntrixTheName";
let pwd = prompt("Enter MySQL password for " + username);

var con = mysql.createConnection({
    host: "localhost",
    user: username,
    password: pwd,
    database: "music-library"
});

con.connect(function(err) {
    if(err) throw err;
    console.log("Connected to database");
});

var url = require('url');

app.get('/connection-test', (routeRequest, routeResult) => {
    routeResult.json({
      message: 'Connected to database_connection.js'
    });
})

app.get('/', (routeRequest, routeResult) => {
    routeResult.sendFile(path.join(__dirname, '/user-selection.html'))
});

app.get('/login', (routeRequest, routeResult) => {

})


//Start the server and listen
app.listen(2492, () => {
    console.log('Server is listening on port 2492');
});