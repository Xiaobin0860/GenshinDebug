// {"retcode":0,"message":"OK","data":{"is_heartbeat_required":false,"is_realname_required":false,"is_guardian_required":false}}

module.exports = {
    execute(req, res) {
        var ret = {
            "retcode":0,
            "message":"OK",
            "data":{
                "is_heartbeat_required":false,
                "is_realname_required":false,
                "is_guardian_required":false
            }
        }
        res.end(JSON.stringify(ret));
    }
}
