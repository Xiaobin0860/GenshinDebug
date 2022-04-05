module.exports = {
    execute(req, res){
        var ret = {
            "retcode":0,
            "message":"OK",
            "data":{
                "list":[{
                    "ann_id":1250,
                    "title":"<b>Welcome to Yuuki Private Server!</b>",
                    "subtitle":"<b>Yuuki Private Server</b>",
                    "banner":"placeholder.png",
                    "content":"Welcome.",
                    "lang":"es-es"
                }],
                "total":1
            }
        }
        res.end(JSON.stringify(ret));
    }
}