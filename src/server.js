// File reading
const fs = require("fs")

// Util
const dataUtil = require("../util/dataUtil");
const sqlite3 = require('sqlite3').verbose();
const handshake = require("../util/handshake");
const c = require("../util/colog");

// Networking
const dgram = require("dgram");
const kcp = require("node-kcp");

// User
var clients = {};

// Untuk testing saja,TODO: add seed key multiple?
var tes_user = "Yuuki";
var tes_level = 50;
var tes_uid = 1;

var seedKey = undefined;
var token = 0x00000000;
var sentTimes = {};
var AreaRspCount, PointRspCount, WorldAreaCount, GachaRspValue = 0

// load key
var initialKey = function () {
    let db = new sqlite3.Database('./keys.db', (error) => {

        if (error) {
            throw error; // handling is amazing
        }

        // this is hardcoded too
        db.get('SELECT * FROM keys WHERE first_bytes=51544', async (err, row) => { // SQLite Database
            initialKey = Buffer.from(row.key_buffer)
        });
    });
}();

// Server dah berjalan di udp?
var server = dgram.createSocket("udp4");

// Handshake buat Terima data dari User
function handleHandshake(data, type) {

    switch (type) {
        case 255: // 0xFF -- Konek Baru
            var buffer = Buffer.from(data)
            var Handshake = new handshake();
            Handshake.decode(buffer);

            var _Conv = (Date.now());
            var _Token = 0xFFCCEEBB ^ ((Date.now() >> 32) & 0xFFFFFFFF);

            var newBuffer = new handshake([0x145, 0x14514545], _Conv, _Token);
            return newBuffer;
        case 404: // 0X194 -- Terputus
            var buffer = Buffer.from(data)
            var Handshake = new handshake(handshake.MAGIC_DISCONNECT);

            seedKey = undefined

            return Handshake
        default:
            console.log("[UNHANDLED HANDSHAKE] %x" + type)
            return;
    }

}

// Handshake buat Kirim data (dengan nama) dari Server
async function sendPacketAsyncByName(kcpobj, name, keyBuffer, Packet = undefined, debug = false) {

    // Reads bin file from packet
    if (Packet == undefined) {
        console.log("[FS] READING %s", name)
        Packet = fs.readFileSync("bin/" + name + ".bin")
    }

    if (parseInt(name.charAt(name.length - 1))) {
        name = name.slice(0, name.length - 1)
    }

    // Determines packetID by name
    const packetID = dataUtil.getPacketIDByProtoName(name);

    // logs packet [DEBUG]
    //console.log("Packet: ",Packet);

    // Sends packet
    kcpobj.send(await dataUtil.dataToPacket(Packet, packetID, keyBuffer));

    if (debug)
        console.log("[SENT] %i (%s) was sent back", packetID, name)
}

// Handshake buat Kirim data (dengan id) dari Server
async function handleSendPacket(protobuff, packetID, kcpobj, keyBuffer) {

    // Packed ID By Name so no more HARDCODING
    const packetIdName = dataUtil.getProtoNameByPacketID(packetID);

    // Data is declared here because node-js would say data is already defined
    var data; // data dynamic ini?

    switch (packetIdName) {
        case "PingReq":
            // Ping ke server dengan kirim data waktu kita
            const PingRsp = {
                clientTime: protobuff["clientTime"],
                ueTime: protobuff["ueTime"]
            }
            // To protobuffer
            data = await dataUtil.objToProtobuffer(PingRsp, dataUtil.getPacketIDByProtoName("PingRsp"));
            sendPacketAsyncByName(kcpobj, "PingRsp", keyBuffer, data, false);
            break;
        case "GetPlayerTokenReq":
            // Ini Buat Login jadi harus cek token dulu
            // Needs to be readed and passed to protobuffer to change the secretKeySeed
            const GetPlayerTokenRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("bin/GetPlayerTokenRsp.bin"), dataUtil.getPacketIDByProtoName("GetPlayerTokenRsp"));

            // Secret Key is now 2 to make it easier
            GetPlayerTokenRsp.secretKeySeed = 2
            //GetPlayerTokenRsp.uid = 1
            GetPlayerTokenRsp.accountUid = tes_uid.toString()
            GetPlayerTokenRsp.gmUid = tes_uid.toString()

            // Executes C# compiled EXE that returns the XOR Blob determined by secretKeySeed
            require('child_process').execFile('./yuanshenKey/ConsoleApp2.exe', [2], function (err, data) {
                if (err) {
                    console.log(err)
                }
                seedKey = Buffer.from(data.toString(), 'hex'); // Key
                //console.log("seedKey: ",seedKey);
            });


            data = await dataUtil.objToProtobuffer(GetPlayerTokenRsp, dataUtil.getPacketIDByProtoName("GetPlayerTokenRsp"));
            sendPacketAsyncByName(kcpobj, "GetPlayerTokenRsp", keyBuffer, data)

            break;

        case "PlayerLoginReq": // ini saat sudah login

            sendPacketAsyncByName(kcpobj, "ActivityScheduleInfoNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "PlayerPropNotify", keyBuffer);

            // PlayerDataNotify
            const PlayerDataNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/PlayerDataNotify.bin"), dataUtil.getPacketIDByProtoName("PlayerDataNotify"))
            PlayerDataNotify.nickName = tes_user

            // To protobuffer
            var PlayerDataNotifyData = await dataUtil.objToProtobuffer(PlayerDataNotify, dataUtil.getPacketIDByProtoName("PlayerDataNotify"));
            sendPacketAsyncByName(kcpobj, "PlayerDataNotify", keyBuffer, PlayerDataNotifyData);

            sendPacketAsyncByName(kcpobj, "AchievementUpdateNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "OpenStateUpdateNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "StoreWeightLimitNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "PlayerStoreNotify", keyBuffer);

            //AvatarDataNotify
            const AvatarDataNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/AvatarDataNotify.bin"), dataUtil.getPacketIDByProtoName("AvatarDataNotify"))
            //AvatarDataNotify.avatarList[0].avatarId = 10000034
            AvatarDataNotify.ownedFlycloakList = [140001, 140007]
            // To protobuffer
            var AvatarDataNotifyData = await dataUtil.objToProtobuffer(AvatarDataNotify, dataUtil.getPacketIDByProtoName("AvatarDataNotify"));
            sendPacketAsyncByName(kcpobj, "AvatarDataNotify", keyBuffer, AvatarDataNotifyData);

            sendPacketAsyncByName(kcpobj, "AvatarSatiationDataNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "RegionSearchNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "PlayerEnterSceneNotify", keyBuffer);

            // Response
            const PlayerLoginRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/PlayerLoginRsp.bin"), dataUtil.getPacketIDByProtoName("PlayerLoginRsp"))
            PlayerLoginRsp.targetUid = tes_uid.toString();
            // To protobuffer
            var PlayerLoginRspData = await dataUtil.objToProtobuffer(PlayerLoginRsp, dataUtil.getPacketIDByProtoName("PlayerLoginRsp"));
            sendPacketAsyncByName(kcpobj, "PlayerLoginRsp", keyBuffer, PlayerLoginRspData);

            break;

        case "GetPlayerSocialDetailReq":
            sendPacketAsyncByName(kcpobj, "GetPlayerSocialDetailRsp", keyBuffer);
            break;
        case "GetPlayerBlacklistReq":
            sendPacketAsyncByName(kcpobj, "GetPlayerBlacklistRsp", keyBuffer);
            break;
        case "GetShopReq":
            sendPacketAsyncByName(kcpobj, "GetShopRsp", keyBuffer);
            break;
        case "EnterSceneReadyReq":
            sendPacketAsyncByName(kcpobj, "EnterScenePeerNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "EnterSceneReadyRsp", keyBuffer);
            break;
        case "GetActivityInfoReq":
            const GetActivityInfoRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/GetActivityInfoRsp.bin"), dataUtil.getPacketIDByProtoName("GetActivityInfoRsp"))
            GetActivityInfoRsp.activityInfoList[2].activityId = 2002
            // To protobuffer
            var GetActivityInfoRspData = await dataUtil.objToProtobuffer(GetActivityInfoRsp, dataUtil.getPacketIDByProtoName("GetActivityInfoRsp"));
            sendPacketAsyncByName(kcpobj, "GetActivityInfoRsp", keyBuffer, GetActivityInfoRspData);

        case "SceneInitFinishReq":

            // load dunia (pertama kali)

            // TAB Harian?
            sendPacketAsyncByName(kcpobj, "WorldOwnerDailyTaskNotify", keyBuffer);

            // Info Player
            const WorldPlayerInfoNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/WorldPlayerInfoNotify.bin"), dataUtil.getPacketIDByProtoName("WorldPlayerInfoNotify"))
            WorldPlayerInfoNotify.playerInfoList[0].name = tes_user;
            WorldPlayerInfoNotify.playerInfoList[0].playerLevel = tes_level;
            data = await dataUtil.objToProtobuffer(WorldPlayerInfoNotify, dataUtil.getPacketIDByProtoName("WorldPlayerInfoNotify"));
            sendPacketAsyncByName(kcpobj, "WorldPlayerInfoNotify", keyBuffer, data);

            // Load Dunia Data
            sendPacketAsyncByName(kcpobj, "WorldDataNotify", keyBuffer);

            // ???
            sendPacketAsyncByName(kcpobj, "WorldOwnerBlossomBriefInfoNotify", keyBuffer);

            // Load Team
            sendPacketAsyncByName(kcpobj, "TeamResonanceChangeNotify", keyBuffer);

            // Load Route Map
            sendPacketAsyncByName(kcpobj, "WorldAllRoutineTypeNotify", keyBuffer);

            // ???
            //sendPacketAsyncByName(kcpobj, "SceneForceUnlockNotify", keyBuffer);

            // Load Waktu
            sendPacketAsyncByName(kcpobj, "PlayerGameTimeNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "SceneTimeNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "SceneDataNotify", keyBuffer);

            // Load Cuaca (di set akan berkabut)
            //sendPacketAsyncByName(kcpobj, "SceneAreaWeatherNotify", keyBuffer);

            // Load Avatar?
            sendPacketAsyncByName(kcpobj, "AvatarEquipChangeNotify2", keyBuffer);
            sendPacketAsyncByName(kcpobj, "AvatarEquipChangeNotify1", keyBuffer);
            sendPacketAsyncByName(kcpobj, "AvatarEquipChangeNotify1", keyBuffer);
            sendPacketAsyncByName(kcpobj, "AvatarEquipChangeNotify2", keyBuffer);

            // Load Player/Host?
            sendPacketAsyncByName(kcpobj, "HostPlayerNotify", keyBuffer);

            // Load Player List?
            const ScenePlayerInfoNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/ScenePlayerInfoNotify.bin"), dataUtil.getPacketIDByProtoName("ScenePlayerInfoNotify"))
            ScenePlayerInfoNotify.playerInfoList[0].name = tes_user
            ScenePlayerInfoNotify.playerInfoList[0].onlinePlayerInfo.nickname = tes_user;
            data = await dataUtil.objToProtobuffer(ScenePlayerInfoNotify, dataUtil.getPacketIDByProtoName("ScenePlayerInfoNotify"));
            sendPacketAsyncByName(kcpobj, "ScenePlayerInfoNotify", keyBuffer, data);

            // Load Player?
            sendPacketAsyncByName(kcpobj, "PlayerEnterSceneNotify", keyBuffer);

            //PlayerEnterSceneInfoNotify
            const PlayerEnterSceneInfoNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/PlayerEnterSceneInfoNotify.bin"), dataUtil.getPacketIDByProtoName("PlayerEnterSceneInfoNotify"))
            PlayerEnterSceneInfoNotify.avatarEnterInfo[0].avatarEntityId = 16777961
            // To protobuffer
            var PlayerEnterSceneInfoNotifyData = await dataUtil.objToProtobuffer(PlayerEnterSceneInfoNotify, dataUtil.getPacketIDByProtoName("PlayerEnterSceneInfoNotify"));
            sendPacketAsyncByName(kcpobj, "PlayerEnterSceneInfoNotify", keyBuffer, PlayerEnterSceneInfoNotifyData);

            // Sync Team
            sendPacketAsyncByName(kcpobj, "SyncTeamEntityNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "SyncScenePlayTeamEntityNotify", keyBuffer);

            sendPacketAsyncByName(kcpobj, "ScenePlayBattleInfoListNotify", keyBuffer);
            sendPacketAsyncByName(kcpobj, "SceneTeamUpdateNotify", keyBuffer);

            // Sync Teleport?
            sendPacketAsyncByName(kcpobj, "AllMarkPointNotify", keyBuffer);

            //???
            sendPacketAsyncByName(kcpobj, "PlayerPropNotify1", keyBuffer);

            // Done???
            sendPacketAsyncByName(kcpobj, "SceneInitFinishRsp", keyBuffer);

            break;


        case "PlayerSetPauseReq":
            // Jika User Pause
            const PlayerSetPauseRsp = {
                retcode: 0
            }
            // Response
            // To protobuffer
            data = await dataUtil.objToProtobuffer(PlayerSetPauseRsp, dataUtil.getPacketIDByProtoName("PlayerSetPauseRsp"));
            sendPacketAsyncByName(kcpobj, "PlayerSetPauseRsp", keyBuffer, data);
            break;
        case "SetPlayerSignatureReq":
            // Ganti Signature
            GachaRspValue = parseInt(protobuff.signature)
            const SetPlayerSignatureRsp = {
                retcode: 0,
                signature: protobuff.signature
            }
            data = await dataUtil.objToProtobuffer(SetPlayerSignatureRsp, dataUtil.getPacketIDByProtoName("SetPlayerSignatureRsp"));
            sendPacketAsyncByName(kcpobj, "SetPlayerSignatureRsp", keyBuffer, data)
            break;
        case "GetGachaInfoReq":

            // Buka Info Gacha
            const GetGachaInfoRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/GetGachaInfoRsp.bin"), dataUtil.getPacketIDByProtoName("GetGachaInfoRsp"));
            //console.log(GetGachaInfoRsp.gachaInfoList);

            // Set 0 coin pertama (dari kanan)
            GetGachaInfoRsp.gachaInfoList[0].tenCostItemNum = 0;
            GetGachaInfoRsp.gachaInfoList[0].costItemNum = 0;
            // Set kedua (dari kanan)
            GetGachaInfoRsp.gachaInfoList[1].tenCostItemNum = 0;
            GetGachaInfoRsp.gachaInfoList[1].costItemNum = 0;
            // Set ketiga (dari kanan)
            GetGachaInfoRsp.gachaInfoList[2].tenCostItemNum = 0;
            GetGachaInfoRsp.gachaInfoList[2].costItemNum = 0;

            // kirim ke protobuffer
            data = await dataUtil.objToProtobuffer(GetGachaInfoRsp, dataUtil.getPacketIDByProtoName("GetGachaInfoRsp"));
            sendPacketAsyncByName(kcpobj, "GetGachaInfoRsp", keyBuffer, data);
            break;
        case "DoGachaReq":
            // Proses Gacha Scene
            const DoGachaRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/DoGachaRsp.bin"), dataUtil.getPacketIDByProtoName("DoGachaRsp"))
            DoGachaRsp.tenCostItemNum = 0
            for (let x = 0; x < 19; x++) {
                DoGachaRsp.gachaItemList[x] = {
                    transferItems: [],
                    tokenItemList: [{
                        itemId: 222,
                        count: 15
                    }],
                    gachaItem_: {
                        itemId: GachaRspValue + x,
                        count: 1
                    }
                }
            }
            // To protobuffer
            data = await dataUtil.objToProtobuffer(DoGachaRsp, dataUtil.getPacketIDByProtoName("DoGachaRsp"));
            sendPacketAsyncByName(kcpobj, "DoGachaRsp", keyBuffer, data)
            break;
        case "GetAllSceneGalleryInfoReq":
            // Tab Gallery info
            sendPacketAsyncByName(kcpobj, "GetAllSceneGalleryInfoRsp", keyBuffer,data);
            break;
        case "SetOpenStateReq":
            // Tab Stats Info Gacha Banner?
            sendPacketAsyncByName(kcpobj, "SetOpenStateRsp", keyBuffer,data);
            break;
        case "GetWidgetSlotReq":
            sendPacketAsyncByName(kcpobj, "GetWidgetSlotRsp", keyBuffer)
            break;
        case "GetRegionSearchReq":
            sendPacketAsyncByName(kcpobj, "RegionSearchNotify", keyBuffer)
            break;
        case "ReunionBriefInfoReq":
            sendPacketAsyncByName(kcpobj, "ReunionBriefInfoRsp", keyBuffer)
            break;
        case "GetAllActivatedBargainDataReq":
            sendPacketAsyncByName(kcpobj, "GetAllActivatedBargainDataRsp", keyBuffer);
            break;
        case "GetPlayerFriendListReq":
            sendPacketAsyncByName(kcpobj, "GetPlayerFriendListRsp", keyBuffer);
            break
        case "TowerAllDataReq":
            sendPacketAsyncByName(kcpobj, "TowerAllDataRsp", keyBuffer);
            break;
        case "PathfindingEnterSceneReq":
            sendPacketAsyncByName(kcpobj, "PathfindingEnterSceneRsp", keyBuffer)
            break;
        case "EnterSceneDoneReq":
            sendPacketAsyncByName(kcpobj, "SceneEntityAppearNotify", keyBuffer)
            sendPacketAsyncByName(kcpobj, "EnterSceneDoneRsp", keyBuffer)
            break;
        case "PostEnterSceneReq":
            sendPacketAsyncByName(kcpobj, "PostEnterSceneRsp", keyBuffer)
            break;
        case "GetActivityInfoReq":
            sendPacketAsyncByName(kcpobj, "GetActivityInfoRsp", keyBuffer)
            break;
        case "GetShopmallDataReq":
            sendPacketAsyncByName(kcpobj, "GetShopmallDataRsp", keyBuffer)
            break;
        case "EnterWorldAreaReq":
            var XD3 = WorldAreaCount > 0 ? WorldAreaCount : "";
            sendPacketAsyncByName(kcpobj, "EnterWorldAreaRsp" + XD3, keyBuffer)
            break;
        case "GetSceneAreaReq":
            var XD2 = AreaRspCount > 0 ? AreaRspCount : "";
            sendPacketAsyncByName(kcpobj, "GetSceneAreaRsp" + XD2, keyBuffer)
            AreaRspCount++
            break;
        case "GetScenePointReq":
            var XD = PointRspCount > 0 ? PointRspCount : "";
            sendPacketAsyncByName(kcpobj, "GetScenePointRsp" + XD, keyBuffer)
            PointRspCount++
            break;
        case "EvtCreateGadgetNotify": // jika baru pakai item
        case "EvtDestroyGadgetNotify": //jika sudah pakai item lalu hapus?
        case "EvtDoSkillSuccNotify": // jika sudah pakai item
        case "UnionCmdNotify": // CMD???
        case "QueryPathReq": // QueryPathReq???
        case "ClientAbilityInitFinishNotify": // ini saat sudah selesai login?
        case "ClientAbilityChangeNotify": // Jika client ada berubah?        
        case "EntityConfigHashNotify": // Hash Notif???
            //TODO: FOR DEBUG
            //console.log('hide me');
            break;
        default:
            console.log(c.colog(32, "UNHANDLED PACKET: ") + packetID + "_" + dataUtil.getProtoNameByPacketID(packetID))
            return;
    }
}


module.exports = {

    /*
     port adalah port dari game sendiri, bukan server
     info: https://portforward.com/genshin-impact/
    */

    execute(port) {

        var output = async function (data, size, context) {
            // For some reason some data is undefined or null
            if (data == undefined || data == null || data == NaN) return;
            // Some type of detector for stupid packets
            if (data.length > 26 && data != undefined) {
                data = dataUtil.formatSentPacket(data, token); // Formatting
                // WARNING - MIGHT BE DELETED \\

                var arrayData = dataUtil.getPackets(data); // Splitting all the packets
                for (var k in arrayData) { // In all the splitted packets
                    // send one by one
                    server.send(arrayData[k], 0, arrayData[k].length, context.port, context.address);
                    //console.log("[SENT] " + arrayData[k].toString('hex'))

                }
                return
            }
            server.send(data, 0, size, context.port, context.address);
        };

        // for debug
        server.on('error', (error) => {
            console.log(error);
            //server.close();
        });

        // dapat data dari game?
        server.on('message', async (data, rinfo) => {

            // Extracted from KCP example lol
            var k = rinfo.address + '_' + rinfo.port + '_' + data.readUInt32LE(0).toString(16);
            var bufferMsg = Buffer.from(data);

            // jika handshake
            if (bufferMsg.byteLength <= 20) {

                // Jalankan handshake
                var ret = handleHandshake(bufferMsg, bufferMsg.readInt32BE(0));
                ret.encode();
                console.log("[HANDSHAKE]");

                // Kirim Kembali
                server.send(ret.buffer, 0, ret.buffer.byteLength, rinfo.port, rinfo.address);
                return
            }

            // Jika User ini tidak ada?
            if (undefined === clients[k]) {
                var context = {
                    address: rinfo.address,
                    port: rinfo.port
                };
                var kcpobj = new kcp.KCP(data.readUInt32LE(0), context);
                kcpobj.nodelay(1, 10, 2, 1);
                kcpobj.output(output);
                clients[k] = kcpobj;
            }

            // token! [hardcoded]
            token = data.readUInt32BE(4);

            // Data Penting?
            var kcpobj = clients[k];
            // reformat data dari bufferMsg?
            var reformatedPacket = await dataUtil.reformatKcpPacket(bufferMsg);
            // lalu input
            kcpobj.input(reformatedPacket);
            // lalu update
            kcpobj.update(Date.now())

            // mulai baca kembali?
            var recv = kcpobj.recv();
            if (recv) {

                var packetRemHeader = recv; // Removes Modified KCP Header and leaves the data
                //console.log(c.colog(31, "[RECV] %s"), packetRemHeader.toString('hex'));

                var keyBuffer = seedKey == undefined ? initialKey : seedKey; // Gets key data
                dataUtil.xorData(packetRemHeader, keyBuffer); // xors the data into packetRemHeader

                // Check if recived data is a packet
                if (packetRemHeader.length > 5 && packetRemHeader.readInt16BE(0) == 0x4567 && packetRemHeader.readUInt16BE(packetRemHeader.byteLength - 2) == 0x89AB) {

                    var packetID = packetRemHeader.readUInt16BE(2); // Packet ID

                    /*
                    if (![2349, 373, 3187].includes(packetID)) {
                        console.log(c.colog(32, "[KCP] Got packet %i (%s)"), packetID, dataUtil.getProtoNameByPacketID(packetID)); // Debug
                    }
                    */

                    // [DEBUG] if packet is not known then its stored there with its data
                    if (packetID == parseInt(dataUtil.getProtoNameByPacketID(packetID))) {
                        console.log("[UNK PACKET] " + packetRemHeader.toString('hex'));
                        /*
                        fs.appendFile("./unk/unknown_packets/" + packetID, "unknown", (err) => {
                            if (err)
                                throw err
                        })
                        */
                        return;
                    }

                    // Parse packet data
                    var noMagic = dataUtil.parsePacketData(packetRemHeader);
                    var dataBuffer = await dataUtil.dataToProtobuffer(noMagic, packetID);
                    handleSendPacket(dataBuffer, packetID, kcpobj, keyBuffer);

                }

            }

        });

        // Jalankan dan Cek Server
        server.on('listening', () => {
            var address = server.address();
            console.log(`[KCP ${address.port}] Sudah berjalan`);
        });
        server.bind(port);
    }
}