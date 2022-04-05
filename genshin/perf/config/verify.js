// Seems to be added in 1.5
// {"code":-1,"message":"not matched"}
// its just -1 :XD:

module.exports = {
    execute(req, res) {
        var ret = {"code":-1,"message":"not matched"}
        res.end(JSON.stringify(ret))
    }
}