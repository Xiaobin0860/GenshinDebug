#include "globalmetadataconverter.h"

#include <stdexcept>
#include "binarywriter.h"
#include "globalmetadataformat.h"

struct converter {

    uint8_t const *src;
    size_t src_len;
    binary_writer writer;

    converter(uint8_t const *src, size_t src_len) : src(src), src_len(src_len) {}

    template <typename Header>
    void allocate_header() {
        writer.data.resize(sizeof(Header));
    }

    template <typename Header>
    void set_header(Header const &header) {
        memcpy(writer.data.data(), &header, sizeof(header));
    }

    void copy_section(uint32_t from_offset, uint32_t from_size, uint32_t &to_offset, uint32_t &to_size) {
        if (from_offset > src_len || from_size > src_len - from_offset)
            throw std::runtime_error("Section source exceeds source data size");
        to_offset = writer.data.size();
        to_size = from_size;
        writer.data.insert(writer.data.end(), src + from_offset, src + from_offset + from_size);
    }

    template <typename To, typename From, To Converter(From)>
    void convert_section(uint32_t from_offset, uint32_t from_size, uint32_t &to_offset, uint32_t &to_size) {
        if (from_offset > src_len || from_size > src_len - from_offset)
            throw std::runtime_error("Section source exceeds source data size");
        if (from_size % sizeof(From) != 0)
            throw std::runtime_error("From size should be dividable by the element size");
        size_t count = from_size / sizeof(From);
        to_offset = writer.data.size();
        to_size = count * sizeof(To);
        if (to_size / sizeof(To) != count)
            throw std::runtime_error("Invalid number of elements (too high)");
        writer.data.reserve(writer.data.size() + to_size);
        From *from = (From *) &src[from_offset];
        for (size_t i = 0; i < count; i++) {
            auto converted = Converter(from[i]);
            writer.write(&converted, sizeof(converted));
        }
    }

};


std::vector<uint8_t> convert_to_unity_global_metadata(uint8_t const *data, size_t len) {
    converter cv (data, len);
    auto const &srch = *(Il2CppGlobalMetadataHeaderMihoyo *) data;
    Il2CppGlobalMetadataHeader outh {};
    outh.sanity = 0xfab11baf;
    outh.version = 24;
    cv.allocate_header<Il2CppGlobalMetadataHeader>();
    cv.convert_section<Il2CppStringLiteral, Il2CppStringLiteralMihoyo, convert_Il2CppStringLiteral>(srch.stringLiteralOffset, srch.stringLiteralCount, outh.stringLiteralOffset, outh.stringLiteralCount);
    cv.copy_section(srch.stringLiteralDataOffset, srch.stringLiteralDataCount, outh.stringLiteralDataOffset, outh.stringLiteralDataCount);
    cv.copy_section(srch.stringOffset, srch.stringCount, outh.stringOffset, outh.stringCount);
    cv.copy_section(srch.eventsOffset, srch.eventsCount, outh.eventsOffset, outh.eventsCount);
    cv.convert_section<Il2CppPropertyDefinition, Il2CppPropertyDefinitionMihoyo, convert_Il2CppPropertyDefinition>(srch.propertiesOffset, srch.propertiesCount, outh.propertiesOffset, outh.propertiesCount);
    cv.convert_section<Il2CppMethodDefinition, Il2CppMethodDefinitionMihoyo, convert_Il2CppMethodDefinition>(srch.methodsOffset, srch.methodsCount, outh.methodsOffset, outh.methodsCount);
    cv.copy_section(srch.parameterDefaultValuesOffset, srch.parameterDefaultValuesCount, outh.parameterDefaultValuesOffset, outh.parameterDefaultValuesCount);
    cv.copy_section(srch.fieldDefaultValuesOffset, srch.fieldDefaultValuesCount, outh.fieldDefaultValuesOffset, outh.fieldDefaultValuesCount);
    cv.copy_section(srch.fieldAndParameterDefaultValueDataOffset, srch.fieldAndParameterDefaultValueDataCount, outh.fieldAndParameterDefaultValueDataOffset, outh.fieldAndParameterDefaultValueDataCount);
    cv.copy_section(srch.fieldMarshaledSizesOffset, srch.fieldMarshaledSizesCount, outh.fieldMarshaledSizesOffset, outh.fieldMarshaledSizesCount);
    cv.copy_section(srch.parametersOffset, srch.parametersCount, outh.parametersOffset, outh.parametersCount);
    cv.convert_section<Il2CppFieldDefinition, Il2CppFieldDefinitionMihoyo, convert_Il2CppFieldDefinition>(srch.fieldsOffset, srch.fieldsCount, outh.fieldsOffset, outh.fieldsCount);
    cv.copy_section(srch.genericParametersOffset, srch.genericParametersCount, outh.genericParametersOffset, outh.genericParametersCount);
    cv.copy_section(srch.genericParameterConstraintsOffset, srch.genericParameterConstraintsCount, outh.genericParameterConstraintsOffset, outh.genericParameterConstraintsCount);
    cv.copy_section(srch.genericContainersOffset, srch.genericContainersCount, outh.genericContainersOffset, outh.genericContainersCount);
    cv.copy_section(srch.nestedTypesOffset, srch.nestedTypesCount, outh.nestedTypesOffset, outh.nestedTypesCount);
    cv.copy_section(srch.interfacesOffset, srch.interfacesCount, outh.interfacesOffset, outh.interfacesCount);
    cv.copy_section(srch.vtableMethodsOffset, srch.vtableMethodsCount, outh.vtableMethodsOffset, outh.vtableMethodsCount);
    cv.copy_section(srch.interfaceOffsetsOffset, srch.interfaceOffsetsCount, outh.interfaceOffsetsOffset, outh.interfaceOffsetsCount);
    cv.convert_section<Il2CppTypeDefinition, Il2CppTypeDefinitionMihoyo, convert_Il2CppTypeDefinition>(srch.typeDefinitionsOffset, srch.typeDefinitionsCount, outh.typeDefinitionsOffset, outh.typeDefinitionsCount);
    cv.copy_section(srch.rgctxEntriesOffset, srch.rgctxEntriesCount, outh.rgctxEntriesOffset, outh.rgctxEntriesCount);
    cv.copy_section(srch.imagesOffset, srch.imagesCount, outh.imagesOffset, outh.imagesCount);
    cv.copy_section(srch.assembliesOffset, srch.assembliesCount, outh.assembliesOffset, outh.assembliesCount);
    cv.copy_section(srch.metadataUsageListsOffset, srch.metadataUsageListsCount, outh.metadataUsageListsOffset, outh.metadataUsageListsCount);
    cv.copy_section(srch.metadataUsagePairsOffset, srch.metadataUsagePairsCount, outh.metadataUsagePairsOffset, outh.metadataUsagePairsCount);
    cv.copy_section(srch.fieldRefsOffset, srch.fieldRefsCount, outh.fieldRefsOffset, outh.fieldRefsCount);
    cv.copy_section(srch.referencedAssembliesOffset, srch.referencedAssembliesCount, outh.referencedAssembliesOffset, outh.referencedAssembliesCount);
    cv.copy_section(srch.attributesInfoOffset, srch.attributesInfoCount, outh.attributesInfoOffset, outh.attributesInfoCount);
    cv.copy_section(srch.attributeTypesOffset, srch.attributeTypesCount, outh.attributeTypesOffset, outh.attributeTypesCount);
    cv.copy_section(srch.unresolvedVirtualCallParameterTypesOffset, srch.unresolvedVirtualCallParameterTypesCount, outh.unresolvedVirtualCallParameterTypesOffset, outh.unresolvedVirtualCallParameterTypesCount);
    cv.copy_section(srch.unresolvedVirtualCallParameterRangesOffset, srch.unresolvedVirtualCallParameterRangesCount, outh.unresolvedVirtualCallParameterRangesOffset, outh.unresolvedVirtualCallParameterRangesCount);
    cv.copy_section(srch.windowsRuntimeTypeNamesOffset, srch.windowsRuntimeTypeNamesSize, outh.windowsRuntimeTypeNamesOffset, outh.windowsRuntimeTypeNamesSize);
    cv.copy_section(srch.exportedTypeDefinitionsOffset, srch.exportedTypeDefinitionsCount, outh.exportedTypeDefinitionsOffset, outh.exportedTypeDefinitionsCount);
    cv.set_header(outh);
    return cv.writer.data;
}