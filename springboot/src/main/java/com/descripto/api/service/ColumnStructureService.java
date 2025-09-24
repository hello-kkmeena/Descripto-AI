package com.descripto.api.service;

import com.descripto.api.dto.ColumnStructure;
import com.descripto.api.enums.ColumnDataType;
import com.descripto.api.exception.ExcelProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for detecting and managing column structures from Excel files
 * 
 * @author Descripto Team
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ColumnStructureService {
    
    private final DataTypeInferenceService dataTypeInferenceService;
    
    private static final int MAX_ROWS = 1000;
    private static final int SAMPLE_ROWS_FOR_INFERENCE = 10;
    
    /**
     * Detect column structure from Excel headers and sample data
     * 
     * @param workbook Excel workbook
     * @return List of detected column structures
     */
    public List<ColumnStructure> detectColumnStructure(Workbook workbook) {
        Sheet sheet = workbook.getSheetAt(0);
        
        // Get headers from first row
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            throw new ExcelProcessingException("Excel file is empty or has no headers");
        }
        
        List<String> headers = extractHeaders(headerRow);
        log.info("Detected {} columns: {}", headers.size(), headers);
        
        // Extract sample data for data type inference --    col X row
        List<List<String>> sampleData = extractSampleData(sheet, headers.size());
        
        // Generate column structures
        List<ColumnStructure> columnStructures = new ArrayList<>();
        for (int i = 0; i < headers.size(); i++) {
            String header = headers.get(i); // column name
            List<String> columnData = sampleData.get(i);
            
            ColumnDataType dataType = dataTypeInferenceService.inferDataType(columnData);
            String description = dataTypeInferenceService.generateColumnDescription(dataType, header);
            
            ColumnStructure columnStructure = ColumnStructure.builder()
                    .name(header)
                    .dataType(dataType)
                    .aboutColumn(description)
                    .isNullable(true) // Default to nullable
                    .comment("Auto-detected column structure")
                    .build();
            
            columnStructures.add(columnStructure);
        }
        
        return columnStructures;
    }
    
    /**
     * Validate Excel file against provided column structure
     * 
     * @param workbook Excel workbook
     * @param expectedColumns Expected column structure
     * @return List of validation errors
     */
    public List<String> validateColumnStructure(Workbook workbook, List<ColumnStructure> expectedColumns) {
        List<String> errors = new ArrayList<>();
        Sheet sheet = workbook.getSheetAt(0);
        
        // Validate headers
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            errors.add("Excel file is empty or has no headers");
            return errors;
        }
        
        List<String> actualHeaders = extractHeaders(headerRow);
        
        // Check if all expected columns are present
        for (ColumnStructure expectedColumn : expectedColumns) {
            if (!actualHeaders.contains(expectedColumn.getName())) {
                errors.add("Missing expected column: " + expectedColumn.getName());
            }
        }
        
        // Check for unexpected columns
        for (String actualHeader : actualHeaders) {
            boolean found = expectedColumns.stream()
                    .anyMatch(col -> col.getName().equals(actualHeader));
            if (!found) {
                errors.add("Unexpected column found: " + actualHeader);
            }
        }
        
        // Validate row count
        int rowCount = sheet.getPhysicalNumberOfRows();
        if (rowCount > MAX_ROWS) {
            errors.add("Excel file exceeds maximum row limit of " + MAX_ROWS + ". Found: " + rowCount);
        }
        
        return errors;
    }
    
    /**
     * Extract headers from the first row
     */
    private List<String> extractHeaders(Row headerRow) {
        List<String> headers = new ArrayList<>();
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            String header = getCellValueAsString(cell);
            if (header != null && !header.trim().isEmpty()) {
                headers.add(header.trim());
            }
        }
        return headers;
    }
    
    /**
     * Extract sample data for data type inference
     */
    private List<List<String>> extractSampleData(Sheet sheet, int columnCount) {
        List<List<String>> sampleData = new ArrayList<>();
        
        // Initialize lists for each column
        for (int i = 0; i < columnCount; i++) {
            sampleData.add(new ArrayList<>());
        }
        
        // Extract data from sample rows (skip header row)
        int sampleRows = Math.min(SAMPLE_ROWS_FOR_INFERENCE, sheet.getLastRowNum());
        for (int rowIndex = 1; rowIndex <= sampleRows; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row != null) {
                for (int colIndex = 0; colIndex < columnCount; colIndex++) {
                    Cell cell = row.getCell(colIndex);
                    String value = getCellValueAsString(cell);
                    sampleData.get(colIndex).add(value);
                }
            }
        }
        
        return sampleData;
    }
    
    /**
     * Get cell value as string
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }
}
