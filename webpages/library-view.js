
//Retrieve song information from database for use in the library table
function Database_GetAllSongInfo() {
    fetch("//localhost:2492/song-information")
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
    fetch(`//localhost:2492/song-information/${record_id}`)
    .then((response) => {
        if(!response.ok) {throw new Error(`HTTP error ${response.status}`);}
        return response.json();
    })
    .then((result) => {
        console.log(result);
    })
}