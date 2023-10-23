function Database_GetSongInfo() {
    fetch("//localhost:2492/song-information")
    .then((response) => {
        if(!response.ok) {throw new Error("HTTP error ${response.status}");}
        return response.json();
    })
    .then((result) => {
        console.log(result);

        //Empty the current table
        document.getElementById("library-view").innerHTML = "";

        //Then repopulate with information from database
        for(let i in result) {
            //Create row element
            let row = document.createElement("tr");

            //Create row data elements
            let id = document.createElement("td");
            let title = document.createElement("td");
            let artist = document.createElement("td");

            //Put data into the data elements
            id.textContent = result[i].song_id;
            title.textContent = result[i].title;
            artist.textContent = result[i].artist;

            //Add data elements to the row
            row.appendChild(id);
            row.appendChild(title);
            row.appendChild(artist);

            //Push row to the table
            document.getElementById("library-table").appendChild(row);
        }
    })
}