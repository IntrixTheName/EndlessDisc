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
            [["title", result.title],
            ["artist", result.artist],
            ["year", result.release_year],
            ["track_number", result.track_num],
            ["disc_number", result.disc_num],
            ["grouping", result.grp],
            ["comment", result.comment],
            ["uploader", result.uploader],
            ["language", result.language],
            ["genre", result.genre]];

        document.getElementById("editor-form").innerHTML = "";
        let form = document.getElementById("editor-form");

        //Rebuild the form with the new elements

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
        
        let submit = document.createElement("input");
        submit.setAttribute("type","button"); submit.setAttribute("value","Submit");
        submit.setAttribute("onclick",`Database_UpdateSong(${record_id})`);
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
    console.log(`writing to database with ${record_id}`)

    var song = {
        title: document.getElementById("title").value,
        artist: document.getElementById("artist").value,
        year: document.getElementById("year").value,
        track_num: document.getElementById("track_num").value,
        disc_num: document.getElementById("disc_num").value,
        grouping: document.getElementById("grouping").value,
        comment: document.getElementById("comment").value,
        uploader: document.getElementById("uploader").value,
        language: document.getElementById("language").value,
        genre: document.getElementById("genre").value,
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