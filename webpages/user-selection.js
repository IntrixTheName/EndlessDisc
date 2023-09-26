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
        return response.json();
    })
    .then((result) => {
        console.log(result.message);
        document.getElementById("response").innerHTML = result.message;
    })
    .catch((error) => console.log('trouble with connection'))
}

//Gets all users from the users table and populates dropdown menu on login screen
function Database_GetUsers() {
    console.log("reading users from database");

    fetch("//localhost:2492/get-users")

    .then((response) => {
        //Catch errors here
        if(!response.ok) {throw new Error("HTTP error ${response.status}");}
        return response.json();
    })

    .then((result) => {
        console.log("Query results, users: " + result);
        for(let i in result) {
            let element = document.createElement("option"); //<option></option>   Creates element
            element.textContent = result[i].name; //<option>names[i]</option>   Adds visible text
            element.value = result[i].name; //<option value="names[i]">names[i]</option>   ID handle
            document.getElementById("username").appendChild(element); //Push to HTML file
        }
    })
}

//Selects user to continue with the service
function Login() {
    usr = document.getElementById("username").value;
    pwd = prompt("Password for " + usr + ":");
    console.log("Setting " + usr + " as user");

    fetch("//localhost:2492/login/" + usr + "/" + pwd)

    .then((response) => {
        if(!response.ok) {throw new Error("HTTP error $:response.status}");}
        return response.json();
    })

    .then((result) => {
        console.log("User successfully changed to " + result.user);
        document.getElementById("response").innerHTML = "User successfully changed to " + result.user;
    })

    fetch("//localhost:2492/export-preset");
}