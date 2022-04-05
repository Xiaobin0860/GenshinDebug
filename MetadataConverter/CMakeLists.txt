cmake_minimum_required(VERSION 3.16)
project(easydecrypt)

set(CMAKE_CXX_STANDARD 14)

add_library(mhycrypto crypto/memecrypto.cpp crypto/memecrypto.h crypto/metadata.cpp crypto/metadata.h crypto/metadatastringdec.cpp crypto/metadatastringdec.h)

add_executable(metadata tool/main.cpp   tool/fileutils.cpp tool/fileutils.h tool/binarywriter.h tool/globalmetadataconverter.cpp tool/globalmetadataconverter.h tool/globalmetadataformat.h)
target_link_libraries(metadata PUBLIC mhycrypto)