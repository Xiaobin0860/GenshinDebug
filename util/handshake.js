class handshake {
    static MAGIC_CONNECT = [0xFF, 0xFFFFFFFF];
    static MAGIC_SEND_BACK_CONV = [ 0x145, 0x14514545 ];
    static MAGIC_DISCONNECT = [ 0x194, 0x19419494 ];

    constructor(magic = [0x0, 0x0], conv = 0, token = 0, data = 0) {
        this.Magic1 = magic[0];
        this.Conv = conv;
        this.Token = token;
        this.Data = data;
        this.Magic2 = magic[1];
        this.buffer = 0;
    }

    decode(data) {
        var dataBuffer = Buffer.from(data);
        this.Magic1 = dataBuffer.readUInt32BE(0);
        this.Conv = dataBuffer.readUInt32BE(4);
        this.Token = dataBuffer.readUInt32BE(8);
        this.Data = dataBuffer.readUInt32BE(12);
        this.Magic2 = dataBuffer.readUInt32BE(16);
        this.buffer = dataBuffer;
    }
    
    encode() {
        var buffer = Buffer.alloc(20);
        buffer.writeUInt32BE(this.Magic1, 0);

        buffer.writeUInt32BE(1, 4);
        buffer.writeUInt32BE(1, 8);
        
        buffer.writeUInt32BE(this.Data, 12);
        buffer.writeUInt32BE(this.Magic2, 16);
        this.buffer = buffer;
    }
}

module.exports = handshake;