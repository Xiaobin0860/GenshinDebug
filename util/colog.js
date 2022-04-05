module.exports = {
    colog(color, msg){return '\x1b[' + color + 'm' + msg + '\x1b[0m'}
}