var http = require('http');
//var mysql = require('mysql');
var fs = require('fs');

http.createServer(function (request, response){
    fs.readFile('Project Idea.html', function(err, data){
        response.writeHead(200,{'Content-Type':'text/html'});
        response.write(data);
        return response.end();
    });
}).listen(8080);

