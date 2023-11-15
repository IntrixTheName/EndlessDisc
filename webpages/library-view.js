//const { response } = require("express");

//Retrieve song information from database for use in the library table
function Database_GetAllSongInfo() {
    fetch("/get/song-information")
    .then((response) => {
        if(!response.ok) {throw new Error(`HTTP error ${response.status}`);}
        return response.json();
    })
    .then((result) => {
        console.log(result);

        //Empty the current table
        document.getElementById("library-table").innerHTML = "";

        //Re-implement the header row
        let header = document.createElement("tr");
        let columns = ["ID","Title","Artist"];

        for(let i in columns) {
            let item = document.createElement("th");
            item.textContent = columns[i];
            header.appendChild(item);
        }
        
        //Push header row to table
        document.getElementById("library-table").appendChild(header)

        //Then repopulate with information from database
        for(let i in result) {
            let r = result[i]; //Useful shorthand

            //Create row element, assigns ID and onClick listener
            let row = document.createElement("tr");
            row.id = r.song_id;
            row.setAttribute("value",r.song_id);
            row.setAttribute("onClick",`Database_GetSongInfo(${r.song_id})`);

            //Add each of the datapoints to the row
            let data = [r.song_id, r.title, r.artist];
            for(let j in data) {
                let item = document.createElement("td");
                item.innerText = data[j];
                row.appendChild(item);
            }

            //Push row to the table
            document.getElementById("library-table").appendChild(row);
        }
    })
}



//Get all information for a specific song
function Database_GetSongInfo(record_id) {
    console.log(`Getting specific song info with ${record_id}`);
    fetch(`/get/song-information/${record_id}`)
    .then((response) => {
        if(!response.ok) {throw new Error(`HTTP error ${response.status}`);}
        return response.json();
    })
    .then((result) => {
        console.log(result);

        result = result[0]; //Returns an array with json elements, just make it the json directly

        let items = 
            [["Title", result.title],
            ["Artist", result.artist],
            ["Year", result.release_year],
            ["Track#", result.track_num],
            ["Disc#", result.disc_num],
            ["Grouping", result.grp],
            ["Comment", result.comment],
            ["Uploader", result.uploader],
            ["Language", result.language],
            ["Genre", result.genre]];

        //document.getElementById("editor-form").innerHTML = "";
        let form = document.getElementById("editor-form");
        form.innerHTML = "";
        //form.setAttribute("action",`Database_UpdateSong(${record_id})`);

        //Rebuild the form with the new elements

        function create_input(id, attr, vals) {
            let label = document.createElement("label");
            let input = document.createElement("input");
            label.innerText = id + ": ";
            input.id = id; input.name = id;

            for(let i in attr) {input.setAttribute(attr[i],vals[i]);}

            label.appendChild(input); form.appendChild(label);
            if(id != "Track#") {
                form.appendChild(document.createElement("br"));
                form.appendChild(document.createElement("br"));
            }
            
        }

        create_input("Title",["required"],[""]);
        create_input("Artist",["required"],[""]);
        create_input("Album",[],[]);
        create_input("Year",["max"],["2099"]);
        create_input("Track#",["min","size"],["0","5"]);
        create_input("Disc#",["min","size"],["1","5"]);
        create_input("Grouping",[],[]);
        create_input("Comment",[],[]);
        create_input("Uploader",[],[]);
        create_input("Language",[],[]);
        create_input("Genre",[],[]);
        
        let submit = document.createElement("input");
        submit.setAttribute("type","button");
        submit.setAttribute("onClick",`Database_UpdateSong(${record_id})`);
        submit.setAttribute("value","Submit");
        form.appendChild(submit);

        //Insert the new values from the retrieved information
        for(let i in items) {
            //document.getElementById(items[i][0]).setAttribute("value","");
            if(items[i][1]) {document.getElementById(items[i][0]).setAttribute("value",items[i][1])}
        }
    })
}



//Update a row from the database
function Database_UpdateSong(record_id) {
    console.log(`writing to database with${record_id}`)

    var song = {
        title: document.getElementById("Title").value,
        artist: document.getElementById("Artist").value,
        year: document.getElementById("Year").value,
        track_num: document.getElementById("Track#").value,
        disc_num: document.getElementById("Disc#").value,
        grouping: document.getElementById("Grouping").value,
        comment: document.getElementById("Comment").value,
        uploader: document.getElementById("Uploader").value,
        language: document.getElementById("Language").value,
        genre: document.getElementById("Genre").value,
    }

    console.log(song);

    var requestInfo = { 
        method: "PUT",
        body: JSON.stringify(song),
        headers: { 'Content-Type': 'application/json' }
    }

    fetch(`/put/${record_id}`, requestInfo)
    .then((response) => {
        if(!response.ok) {throw new Error(`HTTP error ${response.status}`);}
        return response.text()
    })
    .then((result) => {
        console.log(result);
        Database_GetAllSongInfo();
    })
    .catch((error) => console.log('record id ' + record_id + ' trouble - ' + error));
}



//Allow a song to be uploaded to the library
function UploadSong() {
    console.log("Uploading songs to database...");

    var requestInfo = { 
        method: "POST",
        headers: { 'Content-Type': 'application/json' }
    }

    fetch('/post/upload-song',requestInfo)
    .then((response) => {
        if(!response.ok) {throw new Error(`HTTP error ${response.status}`);}
        return response.json();
    })
    .then((result) => {
        console.log(result);
        Database_GetAllSongInfo();
    })
}










/*Archive--------------------------------------------------------------------------------------------------------------
        let label = document.createElement("label");
        let input = document.createElement("input");
        label.innerText = "Title: ";
        input.id = "title"; input.name = "title";
        input.setAttribute("required","");
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Artist: ";
        input.id = "artist"; input.name = "artist";
        input.setAttribute("required","");
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Album: ";
        input.id = "album"; input.name = "album";
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Year: ";
        input.id = "year"; input.name = "year";
        input.setAttribute("max","2099");
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Track#: ";
        input.id = "track_num"; input.name = "track_num";
        input.setAttribute("min","0"); input.setAttribute("size","5");
        label.appendChild(input); form.appendChild(label);

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Disc#: ";
        input.id = "disc_num"; input.name = "disc_num";
        input.setAttribute("min","1"); input.setAttribute("size","5");
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Grouping: ";
        input.id = "grouping"; input.name = "grouping";
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Comment: ";
        input.id = "comment"; input.name = "comment";
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Uploader: ";
        input.id = "uploader"; input.name = "uploader";
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Language: ";
        input.id = "language"; input.name = "language";
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));

        label = document.createElement("label");
        input = document.createElement("input");
        label.innerText = "Genre: ";
        input.id = "genre"; input.name = "genre";
        label.appendChild(input); form.appendChild(label);
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));
        */