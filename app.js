//SETUP----------------------------------------------------------------------------------------------------------------

//Require tools
const express = require('express'), cors = require('cors'), bodyParser = require('body-parser'), path = require('path'), upload = require('express-fileupload');
let mysql = require('mysql2'), url = require('url'); //zip = require('7zip')//['7z'];

//Setup express
const app = express();
app.use(cors()); app.use(bodyParser.json()); app.use(express.static(__dirname)); app.use(upload());

//Global variables to make modifications easier
let usr = "IntrixTheName", pwd = "Foxtrot492"; //Bad practice to put pwd in plaintext, but will be dealt with in a later version
let main_file = "webpages/library-view.html"; //Which page is displayed (since multi-page is giving me issues)

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



//ROUTE REQUESTS-------------------------------------------------------------------------------------------------------

//UTILITY----------------------------------------------------------------------

//"Sleep"-ish function, to prevent execution while waiting for a promise to resolve
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Send the main screen
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, main_file));
});

//Test to see if the song data can be read from file
function sample_upload_data(req, res) {
    var exported = require('./upload/mp3tag.json');
    res.json(exported[1]);
}
app.get('/upload-data',sample_upload_data);

//Manually check connection from web server to this file
function connection_test(req, res) {
    res.send('app.js responded'); 
}
app.get('/connection-test', connection_test);

module.exports = connection_test; //For Jest testing



//GET--------------------------------------------------------------------------

//Get limited inforation for all songs (library window)
function get_all_song_information(req, res) {
    console.log("Getting song information from database")
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        let query = "SELECT song_id, title, artist FROM song_info";
        console.log(query);

        con.query(query, function(err, queryResult, fields) {
            if (err) throw err;
            console.log(queryResult);
            res.json(queryResult);
        })
    })
}
app.get('/get/song-information', get_all_song_information)

//Get all information for a specific song (editor window)
function get_song_information(req, res) {
    console.log(`Getting song info for ID #${req.params.id}`);
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        let query = `SELECT * from song_info WHERE song_id = ${req.params.id}`;
        console.log(query);

        con.query(query, function(err, queryResult, fields) {
            if (err) throw err;
            console.log(queryResult);
            res.json(queryResult);
        })
    })
}
app.get('/get/song-information/:id', get_song_information);



//PUT--------------------------------------------------------------------------

//Update record in database
function update_song_info(req, res) {
    con.connect(function(err) {
        if(err) throw err;
        console.log("Connected...");

        const date = new Date();
        let date_string = date.toISOString().split("T")[0]; //yyyy-mm-dd string for database

        console.log(req.body);
        console.log(date_string);

        let info = req.body;
        let columns =
            [["title", info.title],
            ["artist", info.artist],
            ["release_year", info.year],
            ["track_num", info.track_num],
            ["disc_num", info.disc_num],
            ["grp", info.grouping],
            ["comment", info.comment],
            ["uploader", info.uploader],
            ["language", info.language],
            ["genre", info.genre],
            ["last_modified", date_string]] //yyyy-mm-dd string for database

            let query = "UPDATE song_info SET "

            for(let i in columns) { //Add each column to update
                if(columns[i][1]) {query += columns[i][0] + " = \"" + columns[i][1] + "\", ";}
                else {query += columns[i][0] + " = NULL, ";}
            }

            query = query.substring(0, query.length - 2); //Trim comma from end
            query += ` WHERE song_id = ${req.params.id};`; //Specify WHERE condition

            console.log(query);
            
            con.query(query, function(err, result) {
                if (err) throw err;
                console.log(result);
                res.json({
                    message: 'Updated record'
                  });
            })
    })
}
app.put('/put/:id', update_song_info);



//POST-------------------------------------------------------------------------

//Upload new record to database
function upload_song(req, res) {

    function insert(query) {
        return new Promise(function(resolve,reject) {
            con.query(query, function(err, result) {
                if (err) return reject(err); //Reject promise if error
                //inserted_id = result.insertId; //Update the referenced variable
                console.log(`Inserted, id=${result.insertId}`); //Logging
                resolve(result.insertId); //Resolve the promise
            })
        })
    }
    function select(query) {
        return new Promise(function(resolve,reject) {
            con.query(query, function(err,result) {
                if (err) return reject(err);
                console.log("Retrieved data from database");
                resolve(result);
            })
        })
    }

    con.connect(async function(err) {
        if (err) throw err;
        console.log("Connected...");

        //con.beginTransaction()

        const date = new Date();
        let date_string = date.toISOString().split("T")[0]; //yyyy-mm-dd string for database

        let info = require('./upload/mp3tag.json');

        for(let i in info) {
            console.log("Album: " + info[i].Album);
            let entry =
                [["title", info[i].Title],
                ["artist", info[i].Artist],
                ["release_year", info[i].Year],
                ["track_num", info[i].Track],
                ["disc_num", info[i].Disc.length > 2 ? '' : info[i].Disc],
                ["grp", info[i].Grouping],
                ["comment", info[i].Comment],
                ["uploader", info[i].Uploader],
                ["language", info[i].Language],
                ["genre", info[i].Genre],
                ["last_modified", date_string], //yyyy-mm-dd string for database
                ["album", info[i].Disc.length > 2 ? info[i].Disc : info[i].Album]]

            //let album = Number.isInteger(info[i].Disc) ? info[i].Album : info[i].Disc;
            //let superalbum = info[i].SuperAlbum;
            console.log(entry); console.log(entry[11][1]);

            //Format `INSERT INTO <table> (x,y,z) VALUES (a,b,c)`
            let query = "INSERT INTO song_upload (";
            for(let i = 0; i < 11; i++) {
                //query += entry[i][0] + ",";
                if(entry[i][1]) {query += entry[i][0] + ", ";}
            }
            //Remove last comma (-2 because 0-based index) and start second parenthetic block
            query = query.substring(0, query.length - 2) + ") VALUES ("; 
            for(let i = 0; i < 11; i++) {
                if(entry[i][1]) {query += "\"" + entry[i][1] + "\", ";}
                //else{query += "NULL" + ",";}
            }
            query = query.substring(0,query.length - 2) + ")"; //Remove last comma & close

            console.log(query);

            let track_id = null, album_id = null, discard = null;

            track_id = await insert(query)
            album_select = await select(`SELECT album_id FROM album_info WHERE album_name = "${entry[11][1]}"`)
            //console.log(album_select[0].album_id);
            album_select = await insert(`INSERT IGNORE INTO album_info (album_name) VALUES ("${entry[11][1]}")`)
            //if(!album_select.length) {album_select = await insert(`INSERT INTO album_info (album_name) VALUES ("${entry[11][1]}")`)}
            discard = await insert(`INSERT INTO album_contents (song_id, album_id) VALUES (${track_id}, ${album_select[0].album_id})`);

            //await sleep(100)
        }

        res.json({message: "Completed uploading all tracks"})

        /* con.query(query,function(err,result) {
            if (err) throw err;
            console.log("Song written to database");
            routeResult.json({
                message: 'Inserted record ' + result.insertId
              });
        }) */
    })
}
app.post('/post/upload-song', upload_song);



//START SERVER---------------------------------------------------------------------------------------------------------

//Start the server and listen
app.listen(2492, () => {
    console.log('Server is listening on port 2492');
});



//UNUSED ROUTES--------------------------------------------------------------------------------------------------------

/*

//Retreive all users from the database (used to populate dropdown on login screen)
app.get('/get/users', (req, res) => {
    console.log("Reading users from database");
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        let query = "SELECT name FROM user;";
        console.log(query);

        con.query(query, function(err, queryResult, fields) {
            if (err) throw err;
            console.log(queryResult);
            res.json(queryResult);
        })
    })
})




//For handling login, changes user on the database connection
app.get('/login/:usr/:pwd', (req, res) => {
    //Sort the information
    let usr = req.params.usr;
    let pwd = req.params.pwd;

    console.log(`Setting "${usr}" as user`);

    //Change the user
    con.changeUser({
        user: usr,
        password: pwd
    })

    //Send back a message
    res.json({
        message: "Active user changed successfully",
        user: usr
    })
})

//For getting config/presets from database
app.get('/get/export-settings', (req, res) => {
    console.log("Reading export settings from database");
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        let query = "SELECT * from config";
        console.log(query);

        con.query(query, function(err, queryResult, fields) {
            if (err) throw err;
            console.log(queryResult);
            res.json(queryResult);
        })
    })
})

*/