/*
 Port: 
 42472 - TCP
 22101-22102, 42472 - UDP
*/

var port_web = 80;
var port_game = 22102;
var host = 'localhost';

var http   = require("./src/httpserver");
var server = require("./src/server");

// Jalankan Proxy HTTP
http.execute(port_web, host);

// Jalankan Proxy TCP/UDP?
async function r() {
    server.execute(port_game);
}
r();