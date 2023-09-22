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
        //Catch errors here
        if(!response.ok) {throw new Error("HTTP error ${response.status}");}
        return response.text();
    })
    .then((result) => {
        console.log("Query results, users: " + result);
        let names = JSON.parse(result); //Express returns a serialized value (string literal), so JSON.parse converts it back into a JSON object
        for(let i in names) {
            console.log(names[i]);
            let element = document.createElement("option"); //<option></option>   Creates element
            element.textContent = names[i].name; //<option>names[i]</option>   Adds visible text
            element.value = names[i].name; //<option value="names[i]">names[i]</option>   ID for identifying individual elements later
            document.getElementById("username").appendChild(element); //Push to HTML file
        }
    })
}

//Selects user to continue with the service
function SetUser() {
    usr = document.getElementById("username").value;
    pwd = prompt("Password for " + usr + ":");
    console.log("Setting " + usr + " as user");
    fetch("//localhost:2492/login/" + usr + "/" + pwd)
    .then((response) => {
        if(!response.ok) {throw new Error("HTTP error $:response.status}");}
        return response.text();
    })
    .then((result) => {
        console.log("User successfully changed to " + JSON.parse(result).user);
        document.getElementById("response").innerHTML
    })
}