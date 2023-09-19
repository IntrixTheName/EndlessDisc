
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

function Database_ReadUsers() {
    console.log("reading users from database");
}
