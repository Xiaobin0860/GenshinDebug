#ifndef MEMECRYPTO_H
#define MEMECRYPTO_H

#include <cstdint>

struct memecrypto_variant {
    const uint64_t *shuffleTab;
    const uint32_t *magicTab[4];
    const uint8_t *magicTab2;
    const uint8_t *reverseMagicTab2;
};

extern memecrypto_variant memecrypto_variant0;

void memecrypto_prepare_key(const uint8_t *in, uint8_t *out);

void memecrypto_decrypt(const memecrypto_variant *variant, const uint8_t *key, uint8_t *data);

#endif //MEMECRYPTO_H
