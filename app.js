//SETUP----------------------------------------------------------------------------------------------------------------

//Require tools
const express = require('express'), 
    cors = require('cors'),
    bodyParser = require('body-parser'),
    path = require('path'),
    upload = require('express-fileupload'),
    NodeID3 = require('node-id3').Promise,
    zip = require('express-zip');

const { filter } = require('jszip');
let mysql = require('mysql2'), 
    url = require('url'), 
    fs = require('fs'),
    fs_promise = require('fs/promises');

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

//"Sleep"-ish function, to halt execution for X milliseconds
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

//Filter inputs to make sure it's safe
function filter_sql(input) {
    return input
    .replaceAll("\\","\\\\")
    .replaceAll("\"","\\\"")
    .replaceAll("\'","\\\'")
    .replaceAll("%","\\%")
    .replaceAll("_","\\_")
}
function filter_filename(input) {
    return input
    .replaceAll(/[<>:"/\||?*]/g,"_")
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

//Shorthand for insert statements, and to wrap command in a promise
function insert(query) {
    return new Promise(function(resolve,reject) {
        //console.log(query);
        con.query(query, function(err, result) {
            if (err) return reject(err); //Reject promise if error
            //inserted_id = result.insertId; //Update the referenced variable
            //console.log(`Inserted, id=${result.insertId}`); //Logging
            resolve(result); //Resolve the promise
        })
    })
}
//See insert(), similar application to select statements
function select(query) {
    return new Promise(function(resolve,reject) {
        //console.log(query);
        con.query(query, function(err,result) {
            if (err) return reject(err);
            console.log("Selected, data:"); console.log(result);
            resolve(result);
        })
    })
}
//Wraps a promise around reading data from a file
function file_read(path) {
    return new Promise(function(resolve,reject) {
        fs.readFile(path,(err,data) => {
            if (err) return reject(err);
            resolve(data);
        })
    })
}


//GET--------------------------------------------------------------------------

//Get limited inforation for all songs (library window)
function get_all_song_information(req, res) {
    console.log("Getting song information from database")
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected...");

        //Selects info for the HTML table, and orders it by title for searchability
        let query = "SELECT song_id, title, artist FROM song_info ORDER BY title";
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

//Download the exported songs
async function get_export(req,res) {
    console.log("Exporting song library...");
    let files = []

    //Add album art to archive queue
    console.log("Adding album art to archive...");
    const album_art = await fs_promise.readdir("./library/art"); //Get all files in directory
    for(let i in album_art) { //For each file in directory...
        //...add file to queue
        files.push({name: `/art/${filter_filename(album_art[i])}`, path: `./library/art/${album_art[i]}`})
    }
    
    //Add lyrics to archive queue
    console.log("Adding lyrics to archive...");
    const lyrics = await fs_promise.readdir("./library/lrc");
    for(let i in lyrics) {
        files.push({name: `/lrc/${filter_filename(lyrics[i])}`, path: `./library/lrc/${lyrics[i]}`})
    }

    //Transfer mp3's to archive
    console.log("Adding songs to archive...");
    const song_list = await fs_promise.readdir("./library/songs");
    for(let i in song_list) {
        //Grad internal ID from filename
        let song_id = song_list[i].substring(0,song_list[i].lastIndexOf("."));
        
        //Grab updated tags from database
        let tags = await select(`SELECT * FROM song_info WHERE song_id = ${song_id}`);  

        //Housekeeping, because it returns array of JSON
        tags = tags[0]; 

        let album_name = await select(`SELECT album_name FROM album_contents INNER JOIN album_info ON album_contents.album_id = album_info.album_id WHERE song_id = ${song_id}`); //Grab album name

        let tag_buffer = { //Setup for implementing tags to file
            title: tags.title,
            artist: tags.artist,
            album: album_name,
            year: tags.release_year,
            trackNumber: tags.track_num,
            partOfSet: tags.disc_num,
            contentGroup: tags.grp,
            comment: {language: "eng", text: tags.comment},
            language: tags.language,
            genre: tags.genre
        }

        //Write updated tags to file
        let confirm_tags = await NodeID3.update(tag_buffer,`./library/songs/${song_list[i]}`);

        //Add updated file to archive queue
        files.push({name: `/songs/${filter_filename(tags.artist + " - " + tags.title)}.mp3`, path: `./library/songs/${song_id}.mp3`});
    }

    console.log(files);
    res.zip(files,'export.zip');
}
app.get('/get/export',get_export);



//PUT--------------------------------------------------------------------------

//Update record in database
function update_song_info(req, res) {
    con.connect(function(err) {
        if(err) throw err;
        console.log("Connected...");

        const date = new Date();
        let date_string = date.toISOString().split("T")[0]; //yyyy-mm-dd string for database

        //console.log(req.body);
        //console.log(date_string);

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

            //Construct query, `UPDATE song_info SET x = "a", y = "b", ...`
            let query = "UPDATE song_info SET "

            for(let i in columns) { //Add each column to update
                if(columns[i][1]) {query += columns[i][0] + " = \"" + columns[i][1] + "\", ";}
                else {query += columns[i][0] + " = NULL, ";}
            }

            query = query.substring(0, query.length - 2); //Trim comma from end
            query += ` WHERE song_id = ${req.params.id};`; //Specify WHERE for song_id

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
    con.connect(async function(err) {
        if (err) throw err;
        console.log("Connected...");

        //con.beginTransaction()

        const date = new Date();
        let date_string = date.toISOString().split("T")[0]; //yyyy-mm-dd string for database

        let info = require('./upload/mp3tag.json');

        for(let i in info) {
            //console.log("Album: " + info[i].Album);
            let entry =
                [["title", filter_sql(info[i].Title)],
                ["artist", filter_sql(info[i].Artist)],
                ["release_year", info[i].Year],
                ["track_num", info[i].Track],
                ["disc_num", filter_sql(info[i].Disc.length > 2 ? '' : info[i].Disc)],
                ["grp", filter_sql(info[i].Grouping)],
                ["comment", filter_sql(info[i].Comment)],
                ["uploader", info[i].Uploader],
                ["language", info[i].Language],
                ["genre", info[i].Genre],
                ["last_modified", date_string], //yyyy-mm-dd string for database
                ["album", filter_sql(info[i].Disc.length > 2 ? info[i].Disc : info[i].Album)]]

            let filename = info[i].Filename
            //let album = Number.isInteger(info[i].Disc) ? info[i].Album : info[i].Disc;
            //let superalbum = info[i].SuperAlbum;
            //console.log(entry); console.log(entry[11][1]);

            //Format `INSERT INTO <table> (x,y,z) VALUES (a,b,c)`
            let query = "INSERT INTO song_info (";
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
            query = query.substring(0,query.length - 2) + ")"; //Remove last comma & close (filtered components, so filtering whole is unnecessary)

            //Variables for tracking information about upload
            let track_id = null, //ID of track in song_info
            album_select = null, //ID of album in album_info
            discard = null; //Store useless return values

            track_id = await insert(query); track_id = track_id.insertId;

            album_select = await insert(`INSERT INTO album_info (album_name) VALUES ("${entry[11][1]}") ON DUPLICATE KEY UPDATE album_name=album_name`);
            //console.log(album_select);
            album_select = await select(`SELECT album_id FROM album_info WHERE album_name = "${entry[11][1]}"`);
            
            try{let album_art = await file_read(`./upload/art/${entry[11][1]}.jpg`); fs.writeFile(`./library/art/${entry[11][1]}.jpg`,album_art,() => {console.log(`${entry[11][1]}.jpg uploaded`)});}
            catch{console.log(`Album art for ${entry[11][1]} not working`);}

            try{let lyrics = await file_read(`./upload/lrc/${entry[1][1]} - ${entry[0][1]}.lrc`); fs.writeFile(`./library/lrc/${track_id}.lrc`,lyrics,() => {console.log(`${entry[11][1]}.lrc uploaded`)});}
            catch{console.log(`Lyrics for ${entry[1][1]} - ${entry[0][1]} not found`);}

            try{let song = await file_read(`./upload/songs/${info[i].Filename}`); fs.writeFile(`./library/songs/${track_id}.mp3`,song,() => {console.log(`${entry[1][1]} - ${entry[0][1]}.mp3 uploaded`)});}
            catch{console.log(`${info[i].Filename} can't be uploaded`)}
            
            discard = await insert(`INSERT INTO album_contents (song_id, album_id) VALUES (${track_id}, ${album_select[0].album_id})`);

            if(i % Math.floor(info.length / 10) == 0) {console.log(`Uploaded ${Math.ceil(100*(i/info.length))}%`)};
        }

        res.json({message: "Completed uploading all tracks"})
    })
}
app.post('/post/upload-song', upload_song);



//START SERVER---------------------------------------------------------------------------------------------------------

//Start the server and listen
app.listen(2492, () => {
    console.log('Server is listening on port 2492');
});



/*UNUSED ROUTES--------------------------------------------------------------------------------------------------------

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