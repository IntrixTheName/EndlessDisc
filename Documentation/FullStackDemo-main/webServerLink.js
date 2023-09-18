
function doExternalFunction() {
    var name = document.getElementById('new_text_input').value;
    var newtext = "Hello " + name
    console.log(newtext)
    
    document.getElementById("new_result").innerHTML = newtext;
  
}

function queryWebserver() {
    fetch("//localhost:2020/hello")
    .then((response) =>{
       if (!response.ok) {  
            throw new Error('HTTP error: ${response.status}');
        }
        return response.text()
    })
    .then((text) => {
        console.log(text)
        document.getElementById("web_server_result").innerHTML = text   
    })
    .catch((error) => console.log('trouble'));
}

function databaseWrite() {
    console.log("writing to database")
    var company_name = document.getElementById('company_name').value;
    var company_address = document.getElementById('company_address').value;

    var customer = {
        name: company_name,
        address: company_address
    }

    var requestInfo = { 
        method: "POST", 
        body: JSON.stringify(customer), 
        headers: { 'Content-Type': 'application/json' }
    }

    fetch("//localhost:2020/customer", requestInfo)
        .then((response) =>{
        console.log("response = " + response)
        if (!response.ok) {  
                throw new Error('HTTP error: ${response.status}');
            }
            return response.text()
        })
        .then((text) => {
            console.log("text = " + text)
            document.getElementById("database_server_write_result").innerHTML = text
        })
        .catch((error) => console.log('trouble - ' + error));

}
function databaseRead() {
    console.log("reading from database")
    var record_id = document.getElementById('record_id').value;
    fetch("//localhost:2020/customer/"+ record_id)
    .then((response) =>{
       console.log("response = " + response)
       if (!response.ok) {  
            throw new Error('HTTP error: ${response.status}');
        }
        return response.text()
    })
    .then((text) => {
        console.log("text = " + text)
        document.getElementById("database_server_read_result").innerHTML = text
    })
    .catch((error) => console.log('trouble - ' + error));

}