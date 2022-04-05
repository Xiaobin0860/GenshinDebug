
//{"retcode":0,"message":"OK","data":{"id":"none","action":"ACTION_NONE","geetest":null}}
module.exports = {
    execute(req, res){
        var ret = {
            "retcode" : 0,
            "message": "OK",
            "data" :{
                "id":"none",
                "action":"ACTION_NONE",
                "geetest":null
            }
        }
        res.end(JSON.stringify(ret));
    }
}
