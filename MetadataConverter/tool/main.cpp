#include "fileutils.h"
#include "../crypto/memecrypto.h"
#include "../crypto/metadata.h"
#include "globalmetadataconverter.h"
#include <cstdio>
#include <cstring>

void print_help() {
    printf("decryptmeta   <input> <output>    - decrypts global-metadata.dat\n");
    printf("tounitymeta   <input> <output>    - converts the specified Mihoyo global-metadata.dat file to a standard Unity metadata file\n");
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        print_help();
        return 0;
    }

    if (!strcmp(argv[1], "decryptmeta") && argc >= 4) {
        auto fdata = read_file(argv[2]);
        decrypt_global_metadata(fdata.data(), fdata.size());
        write_file(argv[3], fdata.data(), fdata.size() - 0x4000);
    } else if (!strcmp(argv[1], "tounitymeta") && argc >= 4) {
        auto fdata = read_file(argv[2]);
        decrypt_global_metadata(fdata.data(), fdata.size());
        auto unitymeta = convert_to_unity_global_metadata(fdata.data(), fdata.size() - 0x4000);
        write_file(argv[3], unitymeta.data(), unitymeta.size());
    }

    return 0;
}
