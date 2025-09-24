package com.descripto.api.service;

import com.descripto.api.dto.ColumnStructure;
import com.descripto.api.dto.ExcelUploadResponse;
import com.descripto.api.enums.ColumnDataType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Test class for ExcelProcessingService
 * 
 * @author Descripto Team
 */
@ExtendWith(MockitoExtension.class)
class ExcelProcessingServiceTest {

    @Mock
    private ColumnStructureService columnStructureService;

    @InjectMocks
    private ExcelProcessingService excelProcessingService;

    private MockMultipartFile validExcelFile;
    private MockMultipartFile largeFile;
    private MockMultipartFile invalidFile;

    @BeforeEach
    void setUp() {
        // Create test files
        validExcelFile = new MockMultipartFile(
            "file", 
            "test.xlsx", 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "test content".getBytes()
        );
        
        largeFile = new MockMultipartFile(
            "file", 
            "large.xlsx", 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            new byte[26 * 1024 * 1024] // 26 MB
        );
        
        invalidFile = new MockMultipartFile(
            "file", 
            "test.txt", 
            "text/plain",
            "test content".getBytes()
        );
    }

    @Test
    void testProcessExcelFile_UnstructuredMode() {
        // Given
        List<ColumnStructure> expectedColumns = List.of(
            ColumnStructure.builder()
                .name("Product Name")
                .dataType(ColumnDataType.STRING)
                .aboutColumn("Name of the product")
                .isNullable(false)
                .comment("Required field")
                .build()
        );
        
        when(columnStructureService.detectColumnStructure(any()))
            .thenReturn(expectedColumns);

        // When
        ExcelUploadResponse response = excelProcessingService.processExcelFile(
            validExcelFile, false, null);

        // Then
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Column structure detected successfully", response.getMessage());
        assertEquals(expectedColumns.size(), response.getColumnsDetected());
    }

    @Test
    void testProcessExcelFile_StructuredMode() {
        // Given
        String columnsJson = "[{\"name\":\"Product Name\",\"dataType\":\"STRING\",\"aboutColumn\":\"Name of the product\",\"isNullable\":false,\"comment\":\"Required field\"}]";
        
        when(columnStructureService.validateColumnStructure(any(), any()))
            .thenReturn(List.of()); // No validation errors

        // When
        ExcelUploadResponse response = excelProcessingService.processExcelFile(
            validExcelFile, true, columnsJson);

        // Then
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Excel file processed successfully with provided structure", response.getMessage());
    }

    @Test
    void testProcessExcelFile_FileSizeExceeded() {
        // When
        ExcelUploadResponse response = excelProcessingService.processExcelFile(
            largeFile, false, null);

        // Then
        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("File size exceeds maximum limit"));
    }

    @Test
    void testProcessExcelFile_InvalidFileType() {
        // When
        ExcelUploadResponse response = excelProcessingService.processExcelFile(
            invalidFile, false, null);

        // Then
        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("Invalid file type"));
    }

    @Test
    void testProcessExcelFile_NullFile() {
        // When
        ExcelUploadResponse response = excelProcessingService.processExcelFile(
            null, false, null);

        // Then
        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("File is empty or null"));
    }
}
