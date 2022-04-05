var port_web = 80;
//var port_tcp = 42472;
var host = 'localhost'; // dont change

//const { O_NONBLOCK} = require("constants");
//const fs = require("fs")
//var net = require('net');
//const dataUtil = require('./util/dataUtil');
// = net.createServer();

/*
// Buat Server Net (TCP)?
server.listen(port_tcp, host, () => {
    console.log('Server tcp berjalan di port ' + port_tcp);
});

// Call atau cmd
server.on('connection', function (sock) {

    console.log('Tamu Konek: ' + sock.remoteAddress + ':' + sock.remotePort);

    // Jika Ada Data
    sock.on('data', function (data) {
        console.log('DATA ' + sock.remoteAddress + ': \n' + data);
        // Tulis data kembali ke semua yang terhubung, klien akan menerimanya sebagai data dari server
        sock.write("0x0"); // kirim data null/ping pertama kali?
    });
});
*/

// Jalankan Proxy HTTP
require("./src/httpserver").execute(port_web, host);

// Jalankan Proxy TCP/UDP?
async function executePRoxies() {

    /*
    Port: 
    42472 - TCP
    22101-22102, 42472 - UDP
    */

    require("./src/server").execute(22102);

    // Server Toko
    /*
    const name = 'GetShopRsp'; // GetWidgetSlotRsp
    let num = "4";
    const a = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/" + name + num + ".bin"), dataUtil.getPacketIDByProtoName(name));
    */
    //console.log(require('util').inspect(a, false, null, true)); //???

}

executePRoxies();