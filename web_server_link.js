//const { text } = require("express");
//const { json } = require("express");

//Leaving this function in for debugging, but not used anymore
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

function Database_GetUsers() {
    console.log("reading users from database");
    fetch("//localhost:2492/get-users")
    .then((response) => {
        if(!response.ok) {
            throw new Error("HTTP error");
        }
        return response.text();
    })
    .then((result) => {
        console.log("Query results, users: " + result);
        let names = JSON.parse(result);
        for(let i in names) {
            console.log(names[i]);
            let element = document.createElement("option");
            element.textContent = names[i].name;
            element.value = names[i].name;
            document.getElementById("username").appendChild(element);
        }
    })
}
