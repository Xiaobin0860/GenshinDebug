#ifndef BINARYWRITER_H
#define BINARYWRITER_H

#include <cstdint>
#include <cstring>
#include <vector>

struct binary_writer {

    std::vector<uint8_t> data;

    void write(const void *ptr, size_t len) {
        data.insert(data.end(), (uint8_t *) ptr, (uint8_t *) ptr + len);
    }

    template <typename T>
    void write_be(T value) {
        uint8_t d[sizeof(value)];
        memcpy(d, &value, sizeof(value));
        for (size_t i = 0; i < sizeof(value) / 2; i++)
            std::swap(d[i], d[sizeof(value) - 1 - i]);
        write(d, sizeof(value));
    }

};

#endif //BINARYWRITER_H
