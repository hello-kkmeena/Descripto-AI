# Excel Processing API Documentation

## Overview

The Excel Processing API provides functionality to process Excel files (.xlsx, .xls) with two modes:
- **Unstructured Mode**: Auto-detect column structure from headers and sample data
- **Structured Mode**: Validate Excel files against predefined column structure

## Features

- ✅ **File Size Limit**: Maximum 25 MB
- ✅ **Row Limit**: Maximum 1,000 rows
- ✅ **Supported Formats**: .xlsx, .xls
- ✅ **Data Types**: String, Number, Boolean
- ✅ **Column Structure Detection**: Automatic data type inference
- ✅ **Validation**: Comprehensive file and data validation

## API Endpoints

### 1. Process Excel File

**Endpoint**: `POST /api/v1/excel/process`

**Content-Type**: `multipart/form-data`

**Parameters**:
- `file` (required): Excel file (.xlsx or .xls)
- `structured` (required): Boolean flag indicating processing mode
- `columns` (optional): JSON string of column structure (required if structured=true)

**Note**: The `columns` parameter should be a valid JSON string representing an array of column structures. The service will automatically parse this JSON and convert it to `ColumnStructure` objects for validation.

#### Unstructured Mode (structured=false)

Processes Excel file and automatically detects column structure.

**Example Request**:
```bash
curl -X POST "http://localhost:8080/api/v1/excel/process" \
  -F "file=@products.xlsx" \
  -F "structured=false"
```

**Response**:
```json
{
  "success": true,
  "message": "Column structure detected successfully",
  "data": {
    "success": true,
    "message": "Column structure detected successfully",
    "columnStructures": [
      {
        "name": "Product Name",
        "dataType": "STRING",
        "aboutColumn": "Text field for product name",
        "isNullable": true,
        "comment": "Auto-detected column structure"
      },
      {
        "name": "Price",
        "dataType": "NUMBER",
        "aboutColumn": "Numeric field for price",
        "isNullable": true,
        "comment": "Auto-detected column structure"
      }
    ],
    "rowsProcessed": 150,
    "columnsDetected": 2
  }
}
```

#### Structured Mode (structured=true)

Validates Excel file against provided column structure.

**Example Request**:
```bash
curl -X POST "http://localhost:8080/api/v1/excel/process" \
  -F "file=@products.xlsx" \
  -F "structured=true" \
  -F "columns=[{\"name\":\"Product Name\",\"dataType\":\"STRING\",\"isNullable\":false}]"
```

**Response**:
```json
{
  "success": true,
  "message": "Excel file processed successfully with provided structure",
  "data": {
    "success": true,
    "message": "Excel file processed successfully with provided structure",
    "rowsProcessed": 150,
    "columnsDetected": 1
  }
}
```

### 2. Health Check

**Endpoint**: `GET /api/v1/excel/health`

**Response**:
```json
{
  "success": true,
  "message": "Excel processing service is running",
  "data": "Excel processing service is running"
}
```

## Data Types

### ColumnDataType Enum

- **STRING**: Text data (names, descriptions, etc.)
- **NUMBER**: Numeric data (prices, quantities, etc.)
- **BOOLEAN**: Boolean values (true/false, yes/no, 1/0)

## Column Structure

### ColumnStructure Object

```json
{
  "name": "string",           // Column header name
  "dataType": "enum",         // STRING, NUMBER, or BOOLEAN
  "aboutColumn": "string",    // Column description
  "isNullable": "boolean",    // Whether column can be null
  "comment": "string"         // Additional comments
}
```

## Error Handling

### Common Error Responses

#### File Validation Errors
```json
{
  "success": false,
  "message": "Excel file validation failed",
  "error": "File size exceeds maximum limit of 25 MB"
}
```

#### Structure Validation Errors
```json
{
  "success": false,
  "message": "Excel file validation failed",
  "error": "Missing expected column: Product Name; Unexpected column found: Extra Column"
}
```

#### Processing Errors
```json
{
  "success": false,
  "message": "Error processing Excel file: Invalid file type. Only .xlsx and .xls files are allowed"
}
```

## Data Type Inference

The system automatically infers data types by analyzing sample data from the first 10 rows:

- **String Detection**: Text, mixed alphanumeric content, emails, URLs
- **Number Detection**: Pure numbers, decimals, currency values
- **Boolean Detection**: true/false, yes/no, 1/0, y/n values

## File Requirements

- **Format**: .xlsx or .xls only
- **Size**: Maximum 25 MB
- **Rows**: Maximum 1,000 rows (excluding header)
- **Headers**: First row must contain column names
- **Data**: At least one data row required

## Usage Examples

### 1. Auto-Detect Product Catalog Structure

```bash
# Upload product catalog Excel file
curl -X POST "http://localhost:8080/api/v1/excel/process" \
  -F "file=@product_catalog.xlsx" \
  -F "structured=false"
```

### 2. Validate Inventory File

```bash
# Validate against predefined structure
curl -X POST "http://localhost:8080/api/v1/excel/process" \
  -F "file=@inventory.xlsx" \
  -F "structured=true" \
  -F "columns=[{\"name\":\"SKU\",\"dataType\":\"STRING\",\"aboutColumn\":\"Stock keeping unit\",\"isNullable\":false,\"comment\":\"Required field\"},{\"name\":\"Quantity\",\"dataType\":\"NUMBER\",\"aboutColumn\":\"Available quantity\",\"isNullable\":false,\"comment\":\"Required field\"}]"
```

### 3. Process Customer Data

```bash
# Process customer list
curl -X POST "http://localhost:8080/api/v1/excel/process" \
  -F "file=@customers.xlsx" \
  -F "structured=false"
```

## Integration Notes

- **No Data Storage**: The API processes files in memory and does not store data
- **Streaming**: Large files are processed efficiently using Apache POI
- **Validation**: Comprehensive validation ensures data quality
- **Error Handling**: Detailed error messages for debugging
- **Performance**: Optimized for files up to 1,000 rows

## Security Considerations

- File type validation prevents malicious uploads
- File size limits prevent DoS attacks
- Input validation on all parameters
- Proper error handling without information leakage

## Troubleshooting

### Common Issues

1. **File Size Too Large**: Ensure file is under 25 MB
2. **Invalid File Type**: Only .xlsx and .xls files supported
3. **Missing Headers**: First row must contain column names
4. **Empty File**: File must contain at least headers and one data row
5. **Column Mismatch**: In structured mode, ensure column names match exactly

### Debug Information

Enable debug logging in `application.properties`:
```properties
logging.level.com.descripto.api.service=DEBUG
logging.level.com.descripto.api.controller=DEBUG
```

## Support

For issues or questions regarding the Excel Processing API, please contact the development team or refer to the application logs.
