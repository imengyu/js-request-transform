
export const DATA_MODEL_ERROR_REQUIRED_KEY_MISSING = 1000;
export const DATA_MODEL_ERROR_TRY_CONVERT_BAD_TYPE = 1001;
export const DATA_MODEL_ERROR_OVERLAP_TABLE = 1002;
export const DATA_MODEL_ERROR_CANOT_CLONE = 1003;
export const DATA_MODEL_ERROR_PRINT_SOURCE = 1004;
export const DATA_MODEL_ERROR_ARRAY_REQUIRED_KEY_MISSING = 1005;
export const DATA_MODEL_ERROR_ARRAY_IS_NOT_ARRAY = 1006;
export const DATA_MODEL_ERROR_NO_CONVERTER = 1007;
export const DATA_MODEL_ERROR_MUST_PROVIDE_SIDE = 1008;
export const DATA_MODEL_ERROR_REQUIRED_KEY_NULL = 1009;

export function defaultDataErrorFormatHandler(error: number, data: Record<string, string>) {
  switch (error) {
    case DATA_MODEL_ERROR_REQUIRED_KEY_MISSING: 
      return `Convert ${data.sourceKey} faild: Key ${data.sourceKey} is required but not provide. Source: DataModel ${data.source} Check; Obj: ${data.objectName} ${data.serverKey ? ('ServerKey: ' + data.serverKey) : ''}`;
    case DATA_MODEL_ERROR_TRY_CONVERT_BAD_TYPE:
      return `Try to convert a ${data.sourceType} to ${data.targetType}.`;
    case DATA_MODEL_ERROR_OVERLAP_TABLE:
      return `Detected field overlap in the mapper table, raw field name ${data.key}, to server field name ${data.serverKey}, which may be due to duplicate fields in your _nameMapperClient table!`;
    case DATA_MODEL_ERROR_CANOT_CLONE:
      return `This DataModel ${data.objectName} can not be clone.`;
    case DATA_MODEL_ERROR_PRINT_SOURCE:
      return `Source: ${data.objectName}.`;
    case DATA_MODEL_ERROR_ARRAY_REQUIRED_KEY_MISSING:
      return `transformArrayDataModel fail: The required field ${data.sourceKey} is not provide.`
    case DATA_MODEL_ERROR_ARRAY_IS_NOT_ARRAY:
      return `transformArrayDataModel fail: The required field ${data.sourceKey} is not a array.`
    case DATA_MODEL_ERROR_NO_CONVERTER:
      return `Convert ${data.key} faild: No converter was found for type ${data.type}.`;
    case DATA_MODEL_ERROR_MUST_PROVIDE_SIDE:
      return `Convert ${data.key} faild: Must privide ${data.direction}Side.`;
    case DATA_MODEL_ERROR_REQUIRED_KEY_NULL:
      return `Convert ${data.key} faild: Key ${data.key} is required but not provide or null.`;
  } 
  return `Error ${error}: ${data.message}`;
}