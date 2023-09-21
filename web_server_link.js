//const { text } = require("express");
//const { json } = require("express");

//Leaving this function in for debugging, but not used anymore
//Tests if web server can recieve a response from database_connection.js
function TestConnection() {
    fetch("//localhost:2492/connection-test")
    .then((response) => {
        if(!response.ok) {
            throw new Error("HTTP error ${response.status}");
        }
        return response.text();
    })
    .then((text) => {
        console.log(text);
        document.getElementById("response").innerHTML = text;
    })
    .catch((error) => console.log('trouble with '))
}

//Gets all users from the users table and populates dropdown menu on login screen
function Database_GetUsers() {
    console.log("reading users from database");
    fetch("//localhost:2492/get-users")
    .then((response) => {
        if(!response.ok) {
            throw new Error("HTTP error ${response.status}");
        }
        return response.text();
    })
    .then((result) => {
        console.log("Query results, users: " + result);
        let names = JSON.parse(result); //Express returns a string-serialized version, so JSON.parse converts it back into a JSON object
        for(let i in names) {
            console.log(names[i]);
            let element = document.createElement("option"); //Create <option></option>
            element.textContent = names[i].name; //<option>names[i]</option>   Visible text
            element.value = names[i].name; //<option value="names[i]">names[i]</option>   For identifying individual elements later
            document.getElementById("username").appendChild(element); //Push to HTML file
        }
    })
}
