// {"data":null,"message":"系统繁忙，请稍后再试(错误码 -1059)","retcode":-1059}
module.exports = {
    execute(req, res){
        var ret = {
            "data": null,
            "message": "统繁忙，请稍后再试(错误码 -1059)",
            "retcode": -1059
        }
        res.end(JSON.stringify(ret));
    }
}