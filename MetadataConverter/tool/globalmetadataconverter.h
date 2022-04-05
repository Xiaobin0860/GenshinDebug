#ifndef GLOBALMETADATACONVERTER_H
#define GLOBALMETADATACONVERTER_H

#include <cstdint>
#include <cstddef>
#include <vector>

std::vector<uint8_t> convert_to_unity_global_metadata(uint8_t const *data, size_t len);

#endif //GLOBALMETADATACONVERTER_H
