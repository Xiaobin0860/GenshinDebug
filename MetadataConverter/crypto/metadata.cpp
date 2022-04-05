#include "metadata.h"

#include <cstring>
#include "memecrypto.h"
#include "metadatastringdec.h"
#include <stdio.h>

unsigned char initial_prev_xor[] = { 0xad, 0x2f, 0x42, 0x30, 0x67, 0x04, 0xb0, 0x9c, 0x9d, 0x2a, 0xc0, 0xba, 0x0e, 0xbf, 0xa5, 0x68 };

bool get_global_metadata_keys(uint8_t *src, size_t srcn, uint8_t *longkey, uint8_t *shortkey) {
    if (srcn != 0x4000)
        return false;

    if (*(uint16_t *) (src + 0xc8) != 0xfc2e || *(uint16_t *) (src + 0xca) != 0x2cfe)
        return true;

    auto offB00 = *(uint16_t *) (src + 0xd2);

    for (size_t i = 0; i < 16; i++)
        shortkey[i] = src[offB00 + i] ^ src[0x3000 + i];

    for (size_t i = 0; i < 0xb00; i++)
        longkey[i] = src[offB00 + 0x10 + i] ^ src[0x3000 + 0x10 + i] ^ shortkey[i % 16];

    return true;
}

void decrypt_global_metadata(uint8_t *data, size_t size) {
    uint8_t longkey[0xB00];
    uint8_t longkeyp[0xB0];
    uint8_t shortkey[16];
    get_global_metadata_keys(data + size - 0x4000, 0x4000, longkey, shortkey);
    for (int i = 0; i < 16; i++)
        shortkey[i] ^= initial_prev_xor[i];
    memecrypto_prepare_key(longkey, longkeyp);

    auto perentry = (uint32_t) (size / 0x100 / 0x40);
    for (int i = 0; i < 0x100; i++) {
        auto off = (0x40u * perentry) * i;

        uint8_t prev[16];
        memcpy(prev, shortkey, 16);
        for (int j = 0; j < 4; j++) {
            uint8_t curr[16];
            memcpy(curr, &data[off + j * 0x10], 16);

            memecrypto_decrypt(&memecrypto_variant0, longkeyp, curr);

            for (int k = 0; k < 16; k++)
                curr[k] ^= prev[k];

            memcpy(prev, &data[off + j * 0x10], 16);
            memcpy(&data[off + j * 0x10], curr, 16);
        }
    }

    uint8_t literal_dec_key[0x5000];
    decrypt_global_metadata_header_string_fields(data, size, literal_dec_key);
    decrypt_global_metadata_header_string_literals(data, size, literal_dec_key);
}