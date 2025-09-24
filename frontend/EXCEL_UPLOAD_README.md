# 📊 Excel Upload Feature - User Guide

## Overview

The Excel Upload feature allows users to upload Excel files (.xlsx, .xls) and automatically detect their column structure. Users can then review, modify, and validate the detected structure before final processing.

## 🚀 Features

- **File Upload**: Drag & drop or click to browse Excel files
- **Automatic Detection**: AI-powered column structure detection
- **Structure Review**: Edit data types, descriptions, and constraints
- **Validation**: Validate files against modified structure
- **File Limits**: 25 MB max size, 1,000 rows max
- **Supported Formats**: .xlsx and .xls files

## 📋 Workflow

### Step 1: File Upload
1. Navigate to `/excel` or click "Upload Excel" button on homepage
2. Drag & drop Excel file or click "Choose File"
3. File validation (type, size, format)
4. Click "Process File" to detect column structure

### Step 2: Structure Review
1. Review detected columns and data types
2. Modify data types (String, Number, Boolean)
3. Edit "About Column" descriptions
4. Set nullable constraints
5. Add custom comments
6. Click "Validate Structure" when ready

### Step 3: Validation
1. System validates file against modified structure
2. Success confirmation with file summary
3. Option to process another file or return home

## 🔧 Technical Implementation

### API Endpoints

#### 1. Process Excel (Unstructured Mode)
```bash
POST /api/v1/excel/process
Content-Type: multipart/form-data

Parameters:
- file: Excel file (.xlsx or .xls)
- structured: false
```

**Response**:
```json
{
  "success": true,
  "data": {
    "columnStructures": [
      {
        "name": "product name",
        "dataType": "STRING",
        "aboutColumn": "Text field for product name",
        "comment": "Auto-detected column structure",
        "nullable": true
      }
    ],
    "rowsProcessed": 4,
    "columnsDetected": 4
  }
}
```

#### 2. Validate Excel (Structured Mode)
```bash
POST /api/v1/excel/process
Content-Type: multipart/form-data

Parameters:
- file: Excel file (.xlsx or .xls)
- structured: true
- columns: JSON string of column structures
```

### File Validation Rules

- **File Type**: Only .xlsx and .xls files
- **File Size**: Maximum 25 MB
- **Row Limit**: Maximum 1,000 rows
- **Headers**: First row must contain column names
- **Data**: At least one data row required

### Data Types

- **STRING**: Text data (names, descriptions, etc.)
- **NUMBER**: Numeric data (prices, quantities, etc.)
- **BOOLEAN**: Boolean values (true/false, yes/no, 1/0)

## 🎨 User Interface

### Upload Step
- Drag & drop area with visual feedback
- File information display
- File validation error messages
- Process button (enabled after file selection)

### Review Step
- File summary statistics
- Editable column structure table
- Data type dropdowns
- Text input fields for descriptions
- Nullable constraint toggles
- Action buttons (Start Over, Validate Structure)

### Success Step
- Success confirmation with checkmark
- File processing summary
- Navigation options (Process Another File, Back to Home)

## 🔒 Security Features

- **File Type Validation**: Prevents malicious uploads
- **Size Limits**: Prevents DoS attacks
- **Authentication**: Requires valid JWT token
- **Input Sanitization**: Validates all user inputs

## 📱 Responsive Design

- **Mobile-First**: Optimized for all device sizes
- **Touch-Friendly**: Appropriate button sizes and spacing
- **Responsive Tables**: Horizontal scrolling on small screens
- **Flexible Layout**: Adapts to different screen dimensions

## 🚨 Error Handling

### Common Errors
1. **Invalid File Type**: Only .xlsx and .xls files supported
2. **File Too Large**: Exceeds 25 MB limit
3. **Empty File**: No data content
4. **Processing Failed**: Server-side processing errors
5. **Validation Failed**: Structure mismatch errors

### Error Display
- Red error boxes with clear messages
- Field-specific validation errors
- User-friendly error descriptions
- Recovery suggestions

## 🔄 State Management

### Component States
- **upload**: Initial file upload step
- **review**: Column structure review step
- **success**: Validation success step

### Data Flow
1. File selection → File validation → File info storage
2. Process file → API call → Column structure detection
3. Structure review → User modifications → Structure updates
4. Validate structure → API call → Success confirmation

## 🧪 Testing

### Manual Testing Scenarios
1. **Valid Excel Upload**: Test with sample .xlsx file
2. **Invalid File Type**: Try uploading non-Excel files
3. **Large File**: Test with files near size limit
4. **Structure Modification**: Edit column properties
5. **Validation**: Test structure validation process

### Test Files
- Small Excel files (< 1 MB)
- Medium Excel files (1-10 MB)
- Large Excel files (10-25 MB)
- Files with various column types
- Files with different row counts

## 🚀 Future Enhancements

### Planned Features
- **Bulk Upload**: Multiple file processing
- **Template Download**: Pre-defined structure templates
- **Export Results**: Download processed data
- **History**: Track uploaded files and results
- **Advanced Validation**: Custom validation rules

### Performance Improvements
- **Progress Bars**: Upload and processing progress
- **Background Processing**: Non-blocking file operations
- **Caching**: Store processed results
- **Batch Processing**: Multiple file validation

## 📚 Dependencies

### Frontend
- React 18.2.0
- Tailwind CSS 3.4.17
- Axios 1.7.2
- React Toastify 11.0.5

### Backend
- Spring Boot Excel Processing API
- Apache POI for Excel handling
- JWT Authentication

## 🔧 Configuration

### Environment Variables
```bash
REACT_APP_API_URL=https://api.descripto.ai
REACT_APP_API_TIMEOUT_MS=1500
```

### API Configuration
- Base URL: Configurable via environment
- Timeout: 1.5 seconds default
- Authentication: JWT token required
- File limits: 25 MB, 1,000 rows

## 📞 Support

For technical support or feature requests:
- Check application logs for error details
- Verify file format and size requirements
- Ensure proper authentication
- Contact development team for API issues

---

**Note**: This feature requires a valid authentication token and access to the Excel Processing API backend service.

