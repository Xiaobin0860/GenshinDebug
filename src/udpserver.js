// Sniffer or whatever you like to call it
const c = require("../util/colog");
const proxy = require('udp-proxy')
const dataUtil = require("../util/dataUtil");
const kcp = require("node-kcp");
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();

// sussy
var itsSus, packetOrderCount = 0;
var initialKey, yuankey = undefined;

let db = new sqlite3.Database('./keys.db', (error) => {
    if (error) {
        throw error; // wooo
    }

    db.get('SELECT * FROM keys WHERE first_bytes=51544', async (err, row) => { // SQLite Database
        initialKey = Buffer.from(row.key_buffer)
    });
});

var clientClients = {};
var serverClients = {};

async function doTheWholeThing(name, data, rinfo) {
    var client;
    if(name == "SERVER") {
        client = serverClients
    } else {
        client = clientClients
    }

    var k = rinfo.address + '_' + rinfo.port + '_' + data.readUInt32LE(0).toString(16);
    var bufferMsg = Buffer.from(data);

    // didnt know i was also handling handshake here lmao
    if (bufferMsg.byteLength <= 20) { // Handshake
        switch(bufferMsg.readInt32BE(0)) {
            case 0xFF:
                console.log("[HANDSHAKE CONNECT]"); break;
            case 404:
                console.log("[HANDSHAKE DISCONNECT]"); 
                yuankey = undefined
                break;
            default:
                console.log("[WTF IS THIS HANDSHAKE IS NOT HANDLED] " + bufferMsg.readInt32BE(0)); break;
        }
        return
    }

    if (undefined === client[k]) {
        var context = {
            address: rinfo.address,
            port: rinfo.port
        };
        var kcpobj = new kcp.KCP(data.readUInt32LE(0), context);
        //kcpobj.nodelay(0, interval, 0, 0);
        //kcpobj.output(output);
        client[k] = kcpobj;
    }


    var kcpobj = client[k]
    var reformatedPacket = await dataUtil.reformatKcpPacket(bufferMsg);
    kcpobj.input(reformatedPacket)
    kcpobj.update(Date.now())

    var recv = kcpobj.recv();
    if(recv) {
            var keyBuffer = yuankey == undefined ? initialKey : yuankey;
            dataUtil.xorData(recv, keyBuffer);

            console.log("[RECV " + name + "] " + recv.toString('hex'));
    
            if (recv.length > 5 && recv.readInt16BE(0) == 0x4567 && recv.readUInt16BE(recv.byteLength - 2) == 0x89AB) {
                var packetID = recv.readUInt16BE(2); // Packet ID

                console.log(c.colog(32, "[" + name + "] Got packet %i (%s)"), packetID, dataUtil.getProtoNameByPacketID(packetID)); // Debug
                var dataBuffer = await dataUtil.dataToProtobuffer(dataUtil.parsePacketData(recv), packetID);
                console.log(dataBuffer);

                if(packetID != parseInt(dataUtil.getProtoNameByPacketID(packetID))) {
                    var num = 0;
                    while (true) {
                        try {
                            fs.statSync("./bins/" + dataUtil.getProtoNameByPacketID(packetID) + (num > 0 ? num : "") +".bin");
                            num ++
                            continue
                        } catch {
                            fs.writeFile("./bins/" + dataUtil.getProtoNameByPacketID(packetID) + (num > 0 ? num : "") +".bin", dataUtil.parsePacketData(recv), (err) => {
                                console.log(err)
                            });
                            break;
                        }
                    }

                    packetOrderCount++
                    fs.appendFile("./unk/packet_order/" + packetOrderCount + "_" + dataUtil.getProtoNameByPacketID(packetID)+"_"+packetID+"_"+name, dataUtil.parsePacketData(recv), (err) => {
                        console.log(err)
                    });
                }
                else if (packetID == parseInt(dataUtil.getProtoNameByPacketID(packetID))) {
                    itsSus++
                    fs.appendFile("./unk/unknown_packets/" + itsSus + "_" + packetID, "unknown", (err) => {
                        if(err)
                            throw err;
                    })
                    return;
                }

                if(packetID == 118) {
                    var proto = await dataUtil.dataToProtobuffer(dataUtil.removeMagic(recv), "GetPlayerTokenRsp")
                    var execFile = require('child_process').execFile;
                    execFile('./yuanshenKey/ConsoleApp2.exe', [proto.secretKeySeed], function(err, data) {
                        if(err) {
                            console.log(err)
                        } 
                        console.log(proto.secretKeySeed.toString())
                        yuankey = Buffer.from(data.toString(), 'hex');             
                    }); 
                }
                
            }
    }

}

module.exports = {
    async execute(port, host) {
        var options = {
            address: '47.253.49.40',
            port: port,
            localaddress: '127.0.0.1',
            localport: port
        };


        var server = proxy.createServer(options);

        server.on('listening', function (details) {
            console.log(c.colog(32, "[%d] UDP Proxy Listening..."), details.server.port);
        });

        server.on('bound', function (details) {
            console.log('proxy is bound to ' + details.route.address + ':' + details.route.port);
            console.log('peer is bound to ' + details.peer.address + ':' + details.peer.port);
        });

        // 'message' is emitted when the server gets a message
        server.on('message', async function (message, sender) {
            doTheWholeThing("CLIENT", message, sender);
        });

        // 'proxyMsg' is emitted when the bound socket gets a message and it's send back to the peer the socket was bound to
        server.on('proxyMsg', async function (message, sender, peer) {
            doTheWholeThing("SERVER", message, sender);
        });

    }
}