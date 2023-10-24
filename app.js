//Setting up tools
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
let mysql = require('mysql2');
//let zip = require('7zip')//['7z']; //For zipping the files before delivery

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

let url = require('url');



//Send the main screen
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

//Get all information for a specific song (editor window)
app.get('/song-information/:id', (routeRequest, routeResult) => {
    console.log(`Getting song info for ID #${routeRequest.params.id}`);
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        let query = `SELECT * from song_info WHERE song_id = ${routeRequest.params.id}`;
        console.log(query);

        con.query(query, function(err, queryResult, fields) {
            if (err) throw err;
            console.log(queryResult);
            routeResult.json(queryResult);
        })
    })
})



/* //Start transaction on database
app.post('/upload',(routeRequest, routeResult) => {
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        con.beginTransaction()

        let info = routeRequest.body;
        let columns = 
            ["title",
            "artist",
            "release_year",
            "track_num",
            "disc_num",
            "grp",
            "comment",
            "uploader",
            "language",
            "genre",
            "last_modified"];

        let entry = [];

        if(info.title) {entry[0] = info.title;}
        if(info.artist) {entry[1] = info.artist;}
        if(info.year) {entry[2] = info.year;}
        if(info.track) {entry[3] = info.track;}
        if(info.disc) {entry[4] = info.disc;}
        if(info.grouping) {entry[5] = info.grouping;}
        if(info.comment) {entry[6] = info.comment;}
        if(info.uploader) {entry[7] = info.uploader;}
        if(info.language) {entry[8] = info.language;}
        if(info.genre) {entry[9] = info.genre;}
        if(info.last_modified) {entry[10] = info.last_modified;}

        //Format the insert `Insert into <table> (x, y, z) Values (a,b,c)`
        let query = "INSERT INTO song_upload (";
        for(let i in columns) {
            if(entry[i]) {query.concat(columns[i] + ",");}
        }
        query = query.substring(0,query.length - 2); //Remove last comma
        query.concat(") VALUES (");
        for(let i in columns) {
            if(entry[i]) {query.concat("\"" + entry[i] + ",\"")}
        }
        query = query.substring(0,query.length - 2); //Remove last column
        query.concat(")");

        con.query(query,function(err,queryResults,fields) {
            if (err) throw err;
        })
    })
})
 */



//Start the server and listen
app.listen(2492, () => {
    console.log('Server is listening on port 2492');
});