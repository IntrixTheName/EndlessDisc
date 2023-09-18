const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');

app.use(cors())
app.use(bodyParser.json())

var mysql = require('mysql2');

// Create connection to mySQL database
var connection = mysql.createConnection({
  host: "localhost",
  user: "michael",
  password: "Mysqlpassword1+",
  database: "fullstack"
});

var url = require('url');

// Use this section to test that web server is awake and responding

app.get('/hello', (routeRequest, routeResult) => {
  routeResult.json({
    message: 'Hello World'
  });
})


// Use this section to test bringing up initial webpage

app.get('/', (routeRequest, routeResult) => {
  routeResult.sendFile(path.join(__dirname, '/FullStackDemo.html'))
});

// interface Connection {
// Jonathan -  I forgot what we were doing here

//   function connect()
// }

// RealConnection extends Connection{

//   MySql sql = Connection()
//   override function connect() {
//     sql.connect()
//   }
// }

// MockConnection extends Connection {
//   override function connect() {
//     // no op
//   }
// }



app.post('/customer', (routeRequest, routeResult)=> {
  console.log("inside of POST function")

  let customer = routeRequest.body
  let name = customer.name
  let address = customer.address

  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    console.log(name, address);

    var sqlQuery = `INSERT INTO customers (name, address) VALUES ("${name}", "${address}")`;
    connection.query(sqlQuery, function (err, queryResult) {
      if (err) throw err;
      console.log("1 record inserted, ID:" + queryResult.insertId);
      routeResult.json({
        message: 'Inserted record ' + queryResult.insertId
      });
    });
  });
})

app.get('/customer/:id', (routeRequest, routeResult) => {
  var id = routeRequest.params.id

  console.log("inside of read function")
  connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    var sqlQuery = `SELECT * FROM customers WHERE ID ="${id}"`;
    console.log(sqlQuery);

    connection.query(sqlQuery, function (err, queryResult, fields) {
      if (err) throw err;
      console.log("1 record read: " + queryResult[0].name + " " + queryResult[0].address);
      routeResult.json({
        message: 'Retrieved record ' + queryResult[0].name + " " + queryResult[0].address
      });
    });
  });
});

// Activiate the server
app.listen(2020, () => {
    console.log('server is listening on port 2020');
});
