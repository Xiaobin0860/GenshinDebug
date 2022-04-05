#ifndef GLOBALMETADATAFORMAT_H
#define GLOBALMETADATAFORMAT_H

/* Non-Mihoyo Global Metadata format */
struct Il2CppGlobalMetadataHeader {
    uint32_t sanity;
    uint32_t version;
    uint32_t stringLiteralOffset;
    uint32_t stringLiteralCount;
    uint32_t stringLiteralDataOffset;
    uint32_t stringLiteralDataCount;
    uint32_t stringOffset;
    uint32_t stringCount;
    uint32_t eventsOffset;
    uint32_t eventsCount;
    uint32_t propertiesOffset;
    uint32_t propertiesCount;
    uint32_t methodsOffset;
    uint32_t methodsCount;
    uint32_t parameterDefaultValuesOffset;
    uint32_t parameterDefaultValuesCount;
    uint32_t fieldDefaultValuesOffset;
    uint32_t fieldDefaultValuesCount;
    uint32_t fieldAndParameterDefaultValueDataOffset;
    uint32_t fieldAndParameterDefaultValueDataCount;
    uint32_t fieldMarshaledSizesOffset;
    uint32_t fieldMarshaledSizesCount;
    uint32_t parametersOffset;
    uint32_t parametersCount;
    uint32_t fieldsOffset;
    uint32_t fieldsCount;
    uint32_t genericParametersOffset;
    uint32_t genericParametersCount;
    uint32_t genericParameterConstraintsOffset;
    uint32_t genericParameterConstraintsCount;
    uint32_t genericContainersOffset;
    uint32_t genericContainersCount;
    uint32_t nestedTypesOffset;
    uint32_t nestedTypesCount;
    uint32_t interfacesOffset;
    uint32_t interfacesCount;
    uint32_t vtableMethodsOffset;
    uint32_t vtableMethodsCount;
    uint32_t interfaceOffsetsOffset;
    uint32_t interfaceOffsetsCount;
    uint32_t typeDefinitionsOffset;
    uint32_t typeDefinitionsCount;
    uint32_t rgctxEntriesOffset;
    uint32_t rgctxEntriesCount;
    uint32_t imagesOffset;
    uint32_t imagesCount;
    uint32_t assembliesOffset;
    uint32_t assembliesCount;
    uint32_t metadataUsageListsOffset;
    uint32_t metadataUsageListsCount;
    uint32_t metadataUsagePairsOffset;
    uint32_t metadataUsagePairsCount;
    uint32_t fieldRefsOffset;
    uint32_t fieldRefsCount;
    uint32_t referencedAssembliesOffset;
    uint32_t referencedAssembliesCount;
    uint32_t attributesInfoOffset;
    uint32_t attributesInfoCount;
    uint32_t attributeTypesOffset;
    uint32_t attributeTypesCount;
    uint32_t unresolvedVirtualCallParameterTypesOffset;
    uint32_t unresolvedVirtualCallParameterTypesCount;
    uint32_t unresolvedVirtualCallParameterRangesOffset;
    uint32_t unresolvedVirtualCallParameterRangesCount;
    uint32_t windowsRuntimeTypeNamesOffset;
    uint32_t windowsRuntimeTypeNamesSize;
    uint32_t exportedTypeDefinitionsOffset;
    uint32_t exportedTypeDefinitionsCount;
};

struct Il2CppStringLiteral {
    uint32_t length;
    uint32_t dataIndex;
};

struct Il2CppPropertyDefinition {
    uint32_t nameIndex;
    uint32_t get;
    uint32_t set;
    uint32_t attrs;
    uint32_t customAttributeIndex;
    uint32_t token;
};

struct Il2CppMethodDefinition {
    uint32_t nameIndex;
    uint32_t declaringType;
    uint32_t returnType;
    uint32_t parameterStart;
    uint32_t customAttributeIndex;
    uint32_t genericContainerIndex;
    uint32_t methodIndex;
    uint32_t invokerIndex;
    uint32_t reversePInvokeWrapperIndex;
    uint32_t rgctxStartIndex;
    uint32_t rgctxCount;
    uint32_t token;
    uint16_t flags;
    uint16_t iflags;
    uint16_t slot;
    uint16_t parameterCount;
};

struct Il2CppFieldDefinition {
    uint32_t nameIndex;
    uint32_t typeIndex;
    uint32_t customAttributeIndex;
    uint32_t token;
};

struct Il2CppTypeDefinition {
    uint32_t nameIndex;
    uint32_t namespaceIndex;
    uint32_t customAttributeIndex;
    uint32_t byvalTypeIndex;
    uint32_t byrefTypeIndex;
    uint32_t declaringTypeIndex;
    uint32_t parentIndex;
    uint32_t elementTypeIndex;
    uint32_t rgctxStartIndex;
    uint32_t rgctxCount;
    uint32_t genericContainerIndex;
    uint32_t flags;
    uint32_t fieldStart;
    uint32_t methodStart;
    uint32_t eventStart;
    uint32_t propertyStart;
    uint32_t nestedTypesStart;
    uint32_t interfacesStart;
    uint32_t vtableStart;
    uint32_t interfaceOffsetsStart;
    uint16_t method_count;
    uint16_t property_count;
    uint16_t field_count;
    uint16_t event_count;
    uint16_t nested_type_count;
    uint16_t vtable_count;
    uint16_t interfaces_count;
    uint16_t interface_offsets_count;
    uint32_t bitfield;
    uint32_t token;
};

/* Mihoyo Global Metadata format (with shuffled fields) */

struct Il2CppGlobalMetadataHeaderMihoyo {
    uint32_t filler00;
    uint32_t filler04;
    uint32_t filler08;
    uint32_t filler0C;
    uint32_t filler10;
    uint32_t filler14;
    uint32_t stringLiteralDataOffset; // 18
    uint32_t stringLiteralDataCount; // 1C
    uint32_t stringLiteralOffset; // 20
    uint32_t stringLiteralCount; // 24
    uint32_t genericContainersOffset; // 28
    uint32_t genericContainersCount; // 2C
    uint32_t nestedTypesOffset; // 30
    uint32_t nestedTypesCount; // 34
    uint32_t interfacesOffset; // 38
    uint32_t interfacesCount; // 3C
    uint32_t vtableMethodsOffset; // 40
    uint32_t vtableMethodsCount; // 44
    uint32_t interfaceOffsetsOffset; // 48
    uint32_t interfaceOffsetsCount; // 4C
    uint32_t typeDefinitionsOffset; // 50
    uint32_t typeDefinitionsCount; // 54
    uint32_t rgctxEntriesOffset; // 58
    uint32_t rgctxEntriesCount; // 5C
    uint32_t filler60;
    uint32_t filler64;
    uint32_t filler68;
    uint32_t filler6C;
    uint32_t imagesOffset; // 70
    uint32_t imagesCount; // 74
    uint32_t assembliesOffset; // 78
    uint32_t assembliesCount; // 7C
    uint32_t fieldsOffset; //  80
    uint32_t fieldsCount; // 84
    uint32_t genericParametersOffset; // 88
    uint32_t genericParametersCount; // 8C
    uint32_t fieldAndParameterDefaultValueDataOffset; // 90
    uint32_t fieldAndParameterDefaultValueDataCount; // 94
    uint32_t fieldMarshaledSizesOffset; // 98
    uint32_t fieldMarshaledSizesCount; // 9C
    uint32_t referencedAssembliesOffset; // A0
    uint32_t referencedAssembliesCount; // A4
    uint32_t attributesInfoOffset; // A8
    uint32_t attributesInfoCount; // AC
    uint32_t attributeTypesOffset; // B0
    uint32_t attributeTypesCount; // B4
    uint32_t unresolvedVirtualCallParameterTypesOffset; // B8
    uint32_t unresolvedVirtualCallParameterTypesCount; // BC
    uint32_t unresolvedVirtualCallParameterRangesOffset; // C0
    uint32_t unresolvedVirtualCallParameterRangesCount; // C4
    uint32_t windowsRuntimeTypeNamesOffset; // C8
    uint32_t windowsRuntimeTypeNamesSize; // CC
    uint32_t exportedTypeDefinitionsOffset; // D0
    uint32_t exportedTypeDefinitionsCount; // D4
    uint32_t stringOffset; // D8
    uint32_t stringCount; // DC
    uint32_t parametersOffset; // E0
    uint32_t parametersCount; // E4
    uint32_t genericParameterConstraintsOffset; // E8
    uint32_t genericParameterConstraintsCount; // EC
    uint32_t fillerF0;
    uint32_t fillerF4;
    uint32_t metadataUsagePairsOffset; // F8
    uint32_t metadataUsagePairsCount; // FC
    uint32_t filler100;
    uint32_t filler104;
    uint32_t filler108;
    uint32_t filler10C;
    uint32_t fieldRefsOffset; // 110
    uint32_t fieldRefsCount; // 114
    uint32_t eventsOffset; // 118
    uint32_t eventsCount; // 11C
    uint32_t propertiesOffset; // 120
    uint32_t propertiesCount; // 124
    uint32_t methodsOffset; // 128
    uint32_t methodsCount; // 12C
    uint32_t parameterDefaultValuesOffset; // 130
    uint32_t parameterDefaultValuesCount; // 134
    uint32_t fieldDefaultValuesOffset; // 138
    uint32_t fieldDefaultValuesCount; // 13C
    uint32_t filler140;
    uint32_t filler144;
    uint32_t filler148;
    uint32_t filler14C;
    uint32_t metadataUsageListsOffset; // 150
    uint32_t metadataUsageListsCount; // 154
};

struct Il2CppStringLiteralMihoyo {
    uint32_t dataIndex;
    uint32_t length;
};

struct Il2CppPropertyDefinitionMihoyo {
    uint32_t customAttributeIndex;
    uint32_t nameIndex;
    uint32_t filler08;
    uint32_t token;
    uint32_t attrs;
    uint32_t filler14;
    uint32_t set;
    uint32_t get;
};

struct Il2CppMethodDefinitionMihoyo {
    uint32_t returnType;
    uint32_t declaringType;
    uint32_t filler08;
    uint32_t nameIndex;
    uint32_t parameterStart;
    uint32_t genericContainerIndex;
    uint32_t customAttributeIndex;
    uint32_t reversePInvokeWrapperIndex;
    uint32_t filler20;
    uint32_t methodIndex;
    uint32_t invokerIndex;
    uint32_t rgctxCount;
    uint32_t rgctxStartIndex;
    uint16_t parameterCount;
    uint16_t flags;
    uint16_t slot;
    uint16_t iflags;
    uint32_t token;
};

struct Il2CppFieldDefinitionMihoyo {
    uint32_t customAttributeIndex;
    uint32_t typeIndex;
    uint32_t nameIndex;
    uint32_t token;
};

struct Il2CppTypeDefinitionMihoyo {
    uint32_t nameIndex;
    uint32_t namespaceIndex;
    uint32_t customAttributeIndex;
    uint32_t byvalTypeIndex;
    uint32_t byrefTypeIndex;
    uint32_t declaringTypeIndex;
    uint32_t parentIndex;
    uint32_t elementTypeIndex;
    uint32_t rgctxStartIndex;
    uint32_t rgctxCount;
    uint32_t genericContainerIndex;
    uint32_t flags;
    uint32_t fieldStart;
    uint32_t propertyStart;
    uint32_t methodStart;
    uint32_t eventStart;
    uint32_t nestedTypesStart;
    uint32_t interfacesStart;
    uint32_t interfaceOffsetsStart;
    uint32_t vtableStart;
    uint16_t event_count;
    uint16_t method_count;
    uint16_t property_count;
    uint16_t field_count;
    uint16_t vtable_count;
    uint16_t interfaces_count;
    uint16_t interface_offsets_count;
    uint16_t nested_type_count;
    uint32_t bitfield;
    uint32_t token;
};


/* Conversion functions */

template <typename To, typename From>
static inline To convert_Il2CppStringLiteral(From from) {
    To to {};
    to.length = from.length;
    to.dataIndex = from.dataIndex;
    return to;
}

template <typename To, typename From>
static inline To convert_Il2CppPropertyDefinition(From from) {
    To to {};
    to.nameIndex = from.nameIndex;
    to.get = from.get;
    to.set = from.set;
    to.attrs = from.attrs;
    to.customAttributeIndex = from.customAttributeIndex;
    to.token = from.token;
    return to;
}

template <typename To, typename From>
static inline To convert_Il2CppMethodDefinition(From from) {
    To to {};
    to.nameIndex = from.nameIndex;
    to.declaringType = from.declaringType;
    to.returnType = from.returnType;
    to.parameterStart = from.parameterStart;
    to.customAttributeIndex = from.customAttributeIndex;
    to.genericContainerIndex = from.genericContainerIndex;
    to.methodIndex = from.methodIndex;
    to.invokerIndex = from.invokerIndex;
    to.reversePInvokeWrapperIndex = from.reversePInvokeWrapperIndex;
    to.rgctxStartIndex = from.rgctxStartIndex;
    to.rgctxCount = from.rgctxCount;
    to.token = from.token;
    to.flags = from.flags;
    to.iflags = from.iflags;
    to.slot = from.slot;
    to.parameterCount = from.parameterCount;
    return to;
}

template <typename To, typename From>
static inline To convert_Il2CppFieldDefinition(From from) {
    To to {};
    to.nameIndex = from.nameIndex;
    to.typeIndex = from.typeIndex;
    to.customAttributeIndex = from.customAttributeIndex;
    to.token = from.token;
    return to;
}

template <typename To, typename From>
static inline To convert_Il2CppTypeDefinition(From from) {
    To to {};
    to.nameIndex = from.nameIndex;
    to.namespaceIndex = from.namespaceIndex;
    to.customAttributeIndex = from.customAttributeIndex;
    to.byvalTypeIndex = from.byvalTypeIndex;
    to.byrefTypeIndex = from.byrefTypeIndex;
    to.declaringTypeIndex = from.declaringTypeIndex;
    to.parentIndex = from.parentIndex;
    to.elementTypeIndex = from.elementTypeIndex;
    to.rgctxStartIndex = from.rgctxStartIndex;
    to.rgctxCount = from.rgctxCount;
    to.genericContainerIndex = from.genericContainerIndex;
    to.flags = from.flags;
    to.fieldStart = from.fieldStart;
    to.methodStart = from.methodStart;
    to.eventStart = from.eventStart;
    to.propertyStart = from.propertyStart;
    to.nestedTypesStart = from.nestedTypesStart;
    to.interfacesStart = from.interfacesStart;
    to.vtableStart = from.vtableStart;
    to.interfaceOffsetsStart = from.interfaceOffsetsStart;
    to.method_count = from.method_count;
    to.property_count = from.property_count;
    to.field_count = from.field_count;
    to.event_count = from.event_count;
    to.nested_type_count = from.nested_type_count;
    to.vtable_count = from.vtable_count;
    to.interfaces_count = from.interfaces_count;
    to.interface_offsets_count = from.interface_offsets_count;
    to.bitfield = from.bitfield;
    to.token = from.token;
    return to;
}

#endif