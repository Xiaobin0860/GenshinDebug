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

var clients = {};

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

// i hardcoded this so bad lmao
var seedKey = undefined; // Hardcoding is no more :crab:
var token = 0x00000000;

var server = dgram.createSocket("udp4");




function handleHandshake(data, type) {
    console.log(data);
    switch (type) {
        case 255: // 0xFF -- NEW CONNECTION
            var buffer = Buffer.from(data)
            var Handshake = new handshake();
            Handshake.decode(buffer);

            var _Conv = (Date.now());
            var _Token = 0xFFCCEEBB ^ ((Date.now() >> 32) & 0xFFFFFFFF);

            var newBuffer = new handshake([0x145, 0x14514545], _Conv, _Token);
            return newBuffer;
        case 404: // 0X194 -- DISCONNECTION
            var buffer = Buffer.from(data)
            var Handshake = new handshake(handshake.MAGIC_DISCONNECT);

            seedKey = undefined

            return Handshake
        default:
            console.log("[UNHANDLED HANDSHAKE] %x" + type)
            return;
    }


}

var sentTimes = {}
async function sendPacketAsyncByName(kcpobj, name, keyBuffer, Packet = undefined) {

    // Reads the bin file from the packet
    if (Packet == undefined) {
        //console.log("[FS] READING %s", name)
        Packet = fs.readFileSync("bin/" + name + ".bin")
    }

    if (parseInt(name.charAt(name.length - 1))) {
        name = name.slice(0, name.length - 1)
    }
    // Determines packetID by name
    const packetID = dataUtil.getPacketIDByProtoName(name)

    // logs the packet [DEBUG]
    //console.log(Packet)
    // Sends the packet
    kcpobj.send(await dataUtil.dataToPacket(Packet, packetID, keyBuffer));
    console.log("[SENT] %i (%s) was sent back", packetID, name)
}

var AreaRspCount, PointRspCount, WorldAreaCount, GachaRspValue = 0

async function handleSendPacket(protobuff, packetID, kcpobj, keyBuffer) {

    // Packed ID By Name so no more HARDCODING
    const packetIdName = dataUtil.getProtoNameByPacketID(packetID);

    // Data is declared here because node-js would say data is already defined
    var data;
    switch (packetIdName) {
        case "PingReq": // PingReq

            const PingRsp = {
                clientTime: protobuff["clientTime"],
                ueTime: protobuff["ueTime"]
            }

            // To protobuffer
            data = await dataUtil.objToProtobuffer(PingRsp, dataUtil.getPacketIDByProtoName("PingRsp"));
            sendPacketAsyncByName(kcpobj, "PingRsp", keyBuffer, data)


            break;

        case "GetPlayerTokenReq": // GetPlayerTokenReq

            // Needs to be readed and passed to protobuffer to change the secretKeySeed
            const GetPlayerTokenRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("bin/GetPlayerTokenRsp.bin"), dataUtil.getPacketIDByProtoName("GetPlayerTokenRsp"))

            // Secret Key is now 2 to make it easier
            GetPlayerTokenRsp.secretKeySeed = 2
            //GetPlayerTokenRsp.uid = 1
            GetPlayerTokenRsp.accountUid = "1"
            GetPlayerTokenRsp.gmUid = "1"

            // Executes C# compiled EXE that returns the XOR Blob determined by secretKeySeed
            require('child_process').execFile('./yuanshenKey/ConsoleApp2.exe', [2], function (err, data) {
                if (err) {
                    console.log(err)
                }
                seedKey = Buffer.from(data.toString(), 'hex'); // Key
            });


            data = await dataUtil.objToProtobuffer(GetPlayerTokenRsp, dataUtil.getPacketIDByProtoName("GetPlayerTokenRsp"));
            sendPacketAsyncByName(kcpobj, "GetPlayerTokenRsp", keyBuffer, data)

            break;

        case "PlayerLoginReq": // PlayerLoginReq

            // ActivityScheduleInfoNotify
            sendPacketAsyncByName(kcpobj, "ActivityScheduleInfoNotify", keyBuffer);

            // PlayerPropNotify
            sendPacketAsyncByName(kcpobj, "PlayerPropNotify", keyBuffer);

            // PlayerDataNotify
            const PlayerDataNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/PlayerDataNotify.bin"), dataUtil.getPacketIDByProtoName("PlayerDataNotify"))
            PlayerDataNotify.nickName = "PANCAKE (PS)"
            // To protobuffer
            var PlayerDataNotifyData = await dataUtil.objToProtobuffer(PlayerDataNotify, dataUtil.getPacketIDByProtoName("PlayerDataNotify"));
            sendPacketAsyncByName(kcpobj, "PlayerDataNotify", keyBuffer, PlayerDataNotifyData);

            // AchievementUpdateNotify
            //sendPacketAsyncByName(kcpobj, "AchievementUpdateNotify", keyBuffer);

            // OpenStateUpdateNotify
            sendPacketAsyncByName(kcpobj, "OpenStateUpdateNotify", keyBuffer);

            // StoreWeightLimitNotify
            sendPacketAsyncByName(kcpobj, "StoreWeightLimitNotify", keyBuffer);

            // PlayerStoreNotify
            sendPacketAsyncByName(kcpobj, "PlayerStoreNotify", keyBuffer);

            //AvatarDataNotify
            const AvatarDataNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/AvatarDataNotify.bin"), dataUtil.getPacketIDByProtoName("AvatarDataNotify"))
            //AvatarDataNotify.avatarList[0].avatarId = 10000034
            AvatarDataNotify.ownedFlycloakList = [140001, 140007]
            // To protobuffer
            var AvatarDataNotifyData = await dataUtil.objToProtobuffer(AvatarDataNotify, dataUtil.getPacketIDByProtoName("AvatarDataNotify"));
            sendPacketAsyncByName(kcpobj, "AvatarDataNotify", keyBuffer, AvatarDataNotifyData);

            //AvatarSatiationDataNotify
            sendPacketAsyncByName(kcpobj, "AvatarSatiationDataNotify", keyBuffer);

            //RegionSearchNotify
            sendPacketAsyncByName(kcpobj, "RegionSearchNotify", keyBuffer);

            //PlayerEnterSceneNotify
            sendPacketAsyncByName(kcpobj, "PlayerEnterSceneNotify", keyBuffer);

            // Response
            const PlayerLoginRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/PlayerLoginRsp.bin"), dataUtil.getPacketIDByProtoName("PlayerLoginRsp"))
            PlayerLoginRsp.targetUid = 1
            // To protobuffer
            var PlayerLoginRspData = await dataUtil.objToProtobuffer(PlayerLoginRsp, dataUtil.getPacketIDByProtoName("PlayerLoginRsp"));
            sendPacketAsyncByName(kcpobj, "PlayerLoginRsp", keyBuffer, PlayerLoginRspData);

            break;

        case "GetPlayerSocialDetailReq":

            // Response
            sendPacketAsyncByName(kcpobj, "GetPlayerSocialDetailRsp", keyBuffer)

            break;

        case "ChangeAvatarReq":

            // SceneEntityDisappearNotify
            sendPacketAsyncByName(kcpobj, "SceneEntityDisappearNotify", keyBuffer)

            // SceneEntityAppearNotify
            sendPacketAsyncByName(kcpobj, "SceneEntityAppearNotify", keyBuffer)

            // PlayerEnterSceneInfoNotify
            sendPacketAsyncByName(kcpobj, "PlayerEnterSceneInfoNotify", keyBuffer)

            // Response
            sendPacketAsyncByName(kcpobj, "ChangeAvatarRsp", keyBuffer)

            break;

        case "GetPlayerBlacklistReq":

            // Response
            sendPacketAsyncByName(kcpobj, "GetPlayerBlacklistRsp", keyBuffer)

            break;

        case "GetShopReq":

            // Response
            sendPacketAsyncByName(kcpobj, "GetShopRsp", keyBuffer)

            break;

        case "EnterSceneReadyReq":

            // EnterScenePeerNotify
            sendPacketAsyncByName(kcpobj, "EnterScenePeerNotify", keyBuffer);

            // Response
            sendPacketAsyncByName(kcpobj, "EnterSceneReadyRsp", keyBuffer)

            break;

        case "GetActivityInfoReq":
            const GetActivityInfoRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/GetActivityInfoRsp.bin"), dataUtil.getPacketIDByProtoName("GetActivityInfoRsp"))
            GetActivityInfoRsp.activityInfoList[2].activityId= 2002
            // To protobuffer
            var GetActivityInfoRspData = await dataUtil.objToProtobuffer(GetActivityInfoRsp, dataUtil.getPacketIDByProtoName("GetActivityInfoRsp"));
            sendPacketAsyncByName(kcpobj, "GetActivityInfoRsp", keyBuffer, GetActivityInfoRspData);

        case "SceneInitFinishReq":

            // WorldOwnerDailyTaskNotify
            sendPacketAsyncByName(kcpobj, "WorldOwnerDailyTaskNotify", keyBuffer);

            //WorldPlayerInfoNotify
            const WorldPlayerInfoNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/WorldPlayerInfoNotify.bin"), dataUtil.getPacketIDByProtoName("WorldPlayerInfoNotify"))
            WorldPlayerInfoNotify.playerInfoList[0].name = "PANCAKE (PS)"
            WorldPlayerInfoNotify.playerInfoList[0].playerLevel = 69
            // To protobuffer
            data = await dataUtil.objToProtobuffer(WorldPlayerInfoNotify, dataUtil.getPacketIDByProtoName("WorldPlayerInfoNotify"));
            sendPacketAsyncByName(kcpobj, "WorldPlayerInfoNotify", keyBuffer, data);

            //WorldDataNotify
            sendPacketAsyncByName(kcpobj, "WorldDataNotify", keyBuffer);

            //WorldOwnerBlossomBriefInfoNotify
            sendPacketAsyncByName(kcpobj, "WorldOwnerBlossomBriefInfoNotify", keyBuffer);

            //TeamResonanceChangeNotify
            sendPacketAsyncByName(kcpobj, "TeamResonanceChangeNotify", keyBuffer);

            //WorldAllRoutineTypeNotify
            sendPacketAsyncByName(kcpobj, "WorldAllRoutineTypeNotify", keyBuffer);

            // SceneForceUnlockNotify
            sendPacketAsyncByName(kcpobj, "SceneForceUnlockNotify", keyBuffer);

            //PlayerGameTimeNotify
            sendPacketAsyncByName(kcpobj, "PlayerGameTimeNotify", keyBuffer);

            //SceneTimeNotify
            sendPacketAsyncByName(kcpobj, "SceneTimeNotify", keyBuffer);

            //SceneDataNotify
            sendPacketAsyncByName(kcpobj, "SceneDataNotify", keyBuffer);

            //SceneAreaWeatherNotify
            // sendPacketAsyncByName(kcpobj, "SceneAreaWeatherNotify", keyBuffer);

            //AvatarEquipChangeNotify
            sendPacketAsyncByName(kcpobj, "AvatarEquipChangeNotify2", keyBuffer);

            //AvatarEquipChangeNotify1
            sendPacketAsyncByName(kcpobj, "AvatarEquipChangeNotify1", keyBuffer);

            //AvatarEquipChangeNotify2
            sendPacketAsyncByName(kcpobj, "AvatarEquipChangeNotify1", keyBuffer);

            //AvatarEquipChangeNotify3
            sendPacketAsyncByName(kcpobj, "AvatarEquipChangeNotify2", keyBuffer);

            //HostPlayerNotify
            sendPacketAsyncByName(kcpobj, "HostPlayerNotify", keyBuffer);

            //ScenePlayerInfoNotify
            const ScenePlayerInfoNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/ScenePlayerInfoNotify.bin"), dataUtil.getPacketIDByProtoName("ScenePlayerInfoNotify"))
            ScenePlayerInfoNotify.playerInfoList[0].name = "PANCAKE (PS)"
            ScenePlayerInfoNotify.playerInfoList[0].onlinePlayerInfo.nickname = "PANCAKE (PS)"
            // To protobuffer
            data = await dataUtil.objToProtobuffer(ScenePlayerInfoNotify, dataUtil.getPacketIDByProtoName("ScenePlayerInfoNotify"));
            sendPacketAsyncByName(kcpobj, "ScenePlayerInfoNotify", keyBuffer, data);

            //PlayerEnterSceneNotify
            // sendPacketAsyncByName(kcpobj, "PlayerEnterSceneNotify", keyBuffer);

            //PlayerEnterSceneInfoNotify
            const PlayerEnterSceneInfoNotify = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/PlayerEnterSceneInfoNotify.bin"), dataUtil.getPacketIDByProtoName("PlayerEnterSceneInfoNotify"))
            PlayerEnterSceneInfoNotify.avatarEnterInfo[0].avatarEntityId = 16777961
            // To protobuffer
            var PlayerEnterSceneInfoNotifyData = await dataUtil.objToProtobuffer(PlayerEnterSceneInfoNotify, dataUtil.getPacketIDByProtoName("PlayerEnterSceneInfoNotify"));
            sendPacketAsyncByName(kcpobj, "PlayerEnterSceneInfoNotify", keyBuffer, PlayerEnterSceneInfoNotifyData);

            //SyncTeamEntityNotify
            sendPacketAsyncByName(kcpobj, "SyncTeamEntityNotify", keyBuffer);

            //SyncScenePlayTeamEntityNotify
            sendPacketAsyncByName(kcpobj, "SyncScenePlayTeamEntityNotify", keyBuffer);

            //ScenePlayBattleInfoListNotify
            sendPacketAsyncByName(kcpobj, "ScenePlayBattleInfoListNotify", keyBuffer);

            //SceneTeamUpdateNotify
            sendPacketAsyncByName(kcpobj, "SceneTeamUpdateNotify", keyBuffer);

            //AllMarkPointNotify
            sendPacketAsyncByName(kcpobj, "AllMarkPointNotify", keyBuffer);

            //PlayerPropNotify1
            sendPacketAsyncByName(kcpobj, "PlayerPropNotify1", keyBuffer);

            //SceneInitFinishRsp
            // Response
            sendPacketAsyncByName(kcpobj, "SceneInitFinishRsp", keyBuffer);

            break;

        case "PathfindingEnterSceneReq": // PathfindingEnterSceneReq

            sendPacketAsyncByName(kcpobj, "PathfindingEnterSceneRsp", keyBuffer)


            break;

        case "EnterSceneDoneReq":

            sendPacketAsyncByName(kcpobj, "SceneEntityAppearNotify", keyBuffer)
            sendPacketAsyncByName(kcpobj, "EnterSceneDoneRsp", keyBuffer)


            break;

        case "EnterWorldAreaReq":

            var XD3 = WorldAreaCount > 0 ? WorldAreaCount : "";
            sendPacketAsyncByName(kcpobj, "EnterWorldAreaRsp" + XD3, keyBuffer)

            break;

        case "PostEnterSceneReq":

            sendPacketAsyncByName(kcpobj, "PostEnterSceneRsp", keyBuffer)

            break;

        case "GetActivityInfoReq": // GetActivityInfoReq

            sendPacketAsyncByName(kcpobj, "GetActivityInfoRsp", keyBuffer)

            break;

        case "GetShopmallDataReq":

            sendPacketAsyncByName(kcpobj, "GetShopmallDataRsp", keyBuffer)

            break;

        case "UnionCmdNotify":


            break;

        case "PlayerSetPauseReq": // PlayerSetPauseReq

            const PlayerSetPauseRsp = {
                retcode: 0
            }
            // Response
            // To protobuffer
            data = await dataUtil.objToProtobuffer(PlayerSetPauseRsp, dataUtil.getPacketIDByProtoName("PlayerSetPauseRsp"));
            sendPacketAsyncByName(kcpobj, "PlayerSetPauseRsp", keyBuffer, data)

            break;

        case "GetSceneAreaReq": // GetSceneAreaReq

            // Response
            var XD2 = AreaRspCount > 0 ? AreaRspCount : "";
            sendPacketAsyncByName(kcpobj, "GetSceneAreaRsp" + XD2, keyBuffer)
            AreaRspCount++

            break;

        case "GetScenePointReq": // GetScenePointReq

            // Response
            var XD = PointRspCount > 0 ? PointRspCount : "";
            sendPacketAsyncByName(kcpobj, "GetScenePointRsp" + XD, keyBuffer)
            PointRspCount++

            break;

        case "GetWidgetSlotReq":

            sendPacketAsyncByName(kcpobj, "GetWidgetSlotRsp", keyBuffer)

            break;

        case "GetRegionSearchReq":

            sendPacketAsyncByName(kcpobj, "RegionSearchNotify", keyBuffer)

            break;

        case "ReunionBriefInfoReq": // ReunionBriefInfoReq

            sendPacketAsyncByName(kcpobj, "ReunionBriefInfoRsp", keyBuffer)

            break;

        case "GetAllActivatedBargainDataReq": // GetAllActivatedBargainDataReq

            sendPacketAsyncByName(kcpobj, "GetAllActivatedBargainDataRsp", keyBuffer);

            break;

        case "GetPlayerFriendListReq": // GetPlayerFriendListReq

            sendPacketAsyncByName(kcpobj, "GetPlayerFriendListRsp", keyBuffer);
            break
        case "ClientAbilityInitFinishNotify": // ClientAbilityInitFinishNotify

            console.log("ClientAbilityInitFinishNotify")

            break;

        case "TowerAllDataReq":

            sendPacketAsyncByName(kcpobj, "TowerAllDataRsp", keyBuffer);

            break;

        case "GetShopReq":
            console.log("XD %i", protobuff.shopType)
            sendPacketAsyncByName(kcpobj, "GetShopRsp4", keyBuffer);

            break;

        case "GetGachaInfoReq":
            const GetGachaInfoRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/GetGachaInfoRsp.bin"), dataUtil.getPacketIDByProtoName("GetGachaInfoRsp"))
            GetGachaInfoRsp.gachaInfoList[0].tenCostItemNum = 0
            GetGachaInfoRsp.gachaInfoList[0].costItemNum = 0
            // To protobuffer
            data = await dataUtil.objToProtobuffer(GetGachaInfoRsp, dataUtil.getPacketIDByProtoName("GetGachaInfoRsp"));
            sendPacketAsyncByName(kcpobj, "GetGachaInfoRsp", keyBuffer, data)
            break;
        case "DoGachaReq":
            const DoGachaRsp = await dataUtil.dataToProtobuffer(fs.readFileSync("./bin/DoGachaRsp.bin"), dataUtil.getPacketIDByProtoName("DoGachaRsp"))
            DoGachaRsp.tenCostItemNum = 0
            for(let x = 0; x<19; x++) {
                DoGachaRsp.gachaItemList[x] = {
                        transferItems: [],
                        tokenItemList: [ { itemId: 222, count: 15 } ],
                        gachaItem_: { itemId: GachaRspValue + x, count: 1 }
                }
            }

            // To protobuffer
            data = await dataUtil.objToProtobuffer(DoGachaRsp, dataUtil.getPacketIDByProtoName("DoGachaRsp"));
            sendPacketAsyncByName(kcpobj, "DoGachaRsp", keyBuffer, data)
            break;
        case "SetPlayerSignatureReq":
            GachaRspValue = parseInt(protobuff.signature)
            const SetPlayerSignatureRsp = {
                retcode: 0,
                signature: protobuff.signature
            }
            data = await dataUtil.objToProtobuffer(SetPlayerSignatureRsp, dataUtil.getPacketIDByProtoName("SetPlayerSignatureRsp"));
            sendPacketAsyncByName(kcpobj, "SetPlayerSignatureRsp", keyBuffer, data)
            break;
        case "EntityConfigHashNotify":
        case "EvtAiSyncCombatThreatInfoNotify":
        case "ClientAbilityChangeNotify":
        case "ObstacleModifyNotify":
        case "QueryPathReq":
        case "SetEntityClientDataNotify":
            break;
        default:
            console.log(c.colog(32, "UNHANDLED PACKET: ") + packetID + "_" + dataUtil.getProtoNameByPacketID(packetID))
            return;
    }
}


module.exports = {

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

        server.on('error', (error) => {
            // Wtffff best error handler
            server.close();
        });

        server.on('message', async (data, rinfo) => {
            // Extracted from KCP example lol
            var k = rinfo.address + '_' + rinfo.port + '_' + data.readUInt32LE(0).toString(16);
            var bufferMsg = Buffer.from(data);

            // Detects if its a handshake
            if (bufferMsg.byteLength <= 20) {
                var ret = handleHandshake(bufferMsg, bufferMsg.readInt32BE(0)); // Handling:TM:
                ret.encode(); // Some stupid handshake class i made
                console.log("[HANDSHAKE]")
                // send
                server.send(ret.buffer, 0, ret.buffer.byteLength, rinfo.port, rinfo.address);
                return
            }

            // More stolen shit
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

            // Finally getting into the important shit
            var kcpobj = clients[k];
            var reformatedPacket = await dataUtil.reformatKcpPacket(bufferMsg);
            kcpobj.input(reformatedPacket) // fuck you
            kcpobj.update(Date.now())


            var recv = kcpobj.recv();
            if (recv) {
                var packetRemHeader = recv; // Removes Modified KCP Header and leaves the data

                // console.log(c.colog(31, "[RECV] %s"), packetRemHeader.toString('hex'))

                var keyBuffer = seedKey == undefined ? initialKey : seedKey;    // Gets the key data
                dataUtil.xorData(packetRemHeader, keyBuffer);   // xors the data into packetRemHeader

                // Check if the recived data is a packet
                if (packetRemHeader.length > 5 && packetRemHeader.readInt16BE(0) == 0x4567 && packetRemHeader.readUInt16BE(packetRemHeader.byteLength - 2) == 0x89AB) {
                    var packetID = packetRemHeader.readUInt16BE(2); // Packet ID
                    if (![2349, 373, 3187].includes(packetID)) {
                        console.log(c.colog(32, "[KCP] Got packet %i (%s)"), packetID, dataUtil.getProtoNameByPacketID(packetID)); // Debug
                    }


                    var noMagic = dataUtil.parsePacketData(packetRemHeader); // Parse packet data

                    // [DEBUG] if packet is not known then its stored there with its data
                    if (packetID == parseInt(dataUtil.getProtoNameByPacketID(packetID))) {
                        console.log("[UNK PACKET] " + packetRemHeader.toString('hex'));
                        fs.appendFile("./unk/unknown_packets/" + packetID, "unknown", (err) => {
                            if (err)
                                throw err
                        })
                        return;
                    }

                    // yeah whatever this shit
                    var dataBuffer = await dataUtil.dataToProtobuffer(noMagic, packetID);
                    handleSendPacket(dataBuffer, packetID, kcpobj, keyBuffer);
                }

            }

        });

        // yooo kcp listening
        server.on('listening', () => {
            var address = server.address();
            console.log(`[KCP ${address.port}] LISTENING.`); // He do be listenin doe
        });

        server.bind(port); // binds
    }
}
