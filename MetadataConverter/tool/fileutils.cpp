#include "fileutils.h"

#include <cstdio>

std::vector<uint8_t> read_file(const char *path) {
    FILE *f = fopen(path, "rb");
    if (!f) {
        fprintf(stderr, "File is missing: %s\n", path);
        return std::vector<uint8_t>();
    }
    fseek(f, 0, SEEK_END);
    auto size = ftell(f);
    fseek(f, 0, SEEK_SET);
    std::vector<uint8_t> data;
    data.resize(size);
    if (fread(data.data(), 1, size, f) != size)
        fprintf(stderr, "Read failed (for file at path %s)\n", path);
    fclose(f);
    return data;
}

void write_file(const char *path, const void *buf, size_t size) {
    FILE *f = fopen(path, "wb");
    if (!f) {
        fprintf(stderr, "Could not open file for writing: %s", path);
        return;
    }
    if (fwrite(buf, size, 1, f) != 1)
        fprintf(stderr, "Could not write file body: %s [bytes = %lu]", path, size);
    fclose(f);
}
