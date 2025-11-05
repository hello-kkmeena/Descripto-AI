package com.descripto.api.service;

import com.descripto.api.dto.ColumnStructure;
import com.descripto.api.exception.ExcelProcessingException;
import com.descripto.api.model.ColumnConfig;
import com.descripto.api.model.ProductDetails;
import com.descripto.api.model.ProductGroup;
import com.descripto.api.repository.ColumnConfigRepository;
import com.descripto.api.repository.ProductDetailsRepository;
import com.descripto.api.repository.ProductGroupRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * Service for processing Excel data and storing as product groups
 * 
 * @author Descripto Team
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductGroupDataProcessor {
    
    private final ProductGroupRepository productGroupRepository;
    private final ColumnConfigRepository columnConfigRepository;
    private final ProductDetailsRepository productDetailsRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Process Excel file and store data as product group
     * 
     * @param file Excel file to process
     * @param expectedColumns Expected column structure
     * @param createdBy User ID who uploaded the file
     * @return Processing result with product group ID
     */
    @Transactional(rollbackFor = Exception.class)
    public ProcessingResult processAndStoreExcelData(MultipartFile file, List<ColumnStructure> expectedColumns, Long createdBy) {
        log.info("Starting Excel data processing for user: {}", createdBy);
        
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            String sheetName = sheet.getSheetName();
            
            // Validate headers against expected structure
            List<String> validationErrors = validateHeaders(sheet, expectedColumns);
            if (!validationErrors.isEmpty()) {
                throw new ExcelProcessingException("Header validation failed: " + String.join("; ", validationErrors));
            }
            
            // Map Excel columns to expected columns by name (ensures correct order alignment)
            Map<Integer, ColumnStructure> excelColumnMapping = mapExcelColumnsToExpected(sheet, expectedColumns);
            
            // Create product group
            ProductGroup productGroup = createProductGroup(file, sheet, createdBy, sheetName);
            productGroup = productGroupRepository.save(productGroup);
            log.info("Created product group with ID: {}", productGroup.getId());
            
            // Store column configurations (in Excel order to ensure alignment)
            List<ColumnConfig> columnConfigs = createColumnConfigs(productGroup, excelColumnMapping);
            columnConfigs = columnConfigRepository.saveAll(columnConfigs);
            log.info("Stored {} column configurations", columnConfigs.size());
            
            // Process and store product details
            List<ProductDetails> productDetails = processProductDetails(productGroup, sheet, columnConfigs);
            productDetailsRepository.saveAll(productDetails);
            log.info("Stored {} product details", productDetails.size());
            
            // Update product group status
            productGroup.setProcessingStatus(ProductGroup.ProcessingStatus.COMPLETED);
            productGroup.setNumRows(productDetails.size());
            productGroupRepository.save(productGroup);

            log.info("Sheet upload success");
            
            return ProcessingResult.builder()
                    .success(true)
                    .productGroupId(productGroup.getId())
                    .rowsProcessed(productDetails.size())
                    .columnsDetected(columnConfigs.size())
                    .processingStatus("COMPLETED")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error processing Excel data: {}", e.getMessage(), e);
            throw new ExcelProcessingException("Failed to process Excel data: " + e.getMessage());
        }
    }
    
    /**
     * Validate Excel headers against expected column structure
     */
    private List<String> validateHeaders(Sheet sheet, List<ColumnStructure> expectedColumns) {
        List<String> errors = new ArrayList<>();
        Row headerRow = sheet.getRow(0);
        
        if (headerRow == null) {
            errors.add("Excel file is empty or has no headers");
            return errors;
        }
        
        // Extract actual headers
        List<String> actualHeaders = new ArrayList<>();
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            String header = getCellValueAsString(cell);
            if (header != null && !header.trim().isEmpty()) {
                actualHeaders.add(header.trim());
            }
        }
        
        // Check if all expected columns are present (exact match)
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
        
        return errors;
    }
    
    /**
     * Create product group entity
     */
    private ProductGroup createProductGroup(MultipartFile file, Sheet sheet, Long createdBy, String sheetName) {
        return ProductGroup.builder()
                .name(sheetName)
                .createdBy(createdBy)
                .numColumns((int) sheet.getRow(0).getLastCellNum())
                .numRows(sheet.getLastRowNum()) // Will be updated after processing
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .processingStatus(ProductGroup.ProcessingStatus.PROCESSING)
                .build();
    }
    
    /**
     * Map Excel column positions to expected ColumnStructure by matching column names
     * This ensures correct alignment between Excel column order and ColumnConfig order
     * 
     * @param sheet Excel sheet
     * @param expectedColumns Expected column structures
     * @return Map where key is Excel column index (0-based) and value is matching ColumnStructure
     */
    private Map<Integer, ColumnStructure> mapExcelColumnsToExpected(Sheet sheet, List<ColumnStructure> expectedColumns) {
        Map<Integer, ColumnStructure> mapping = new LinkedHashMap<>();
        Row headerRow = sheet.getRow(0);
        
        if (headerRow == null) {
            throw new ExcelProcessingException("Excel file is empty or has no headers");
        }
        
        // Extract Excel headers in order
        List<String> excelHeaders = new ArrayList<>();
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            String header = getCellValueAsString(cell);
            if (header != null && !header.trim().isEmpty()) {
                excelHeaders.add(header.trim());
            }
        }
        
        // Map each Excel column position to corresponding ColumnStructure by name
        for (int excelIndex = 0; excelIndex < excelHeaders.size(); excelIndex++) {
            final int columnIndex = excelIndex; // Make effectively final for lambda
            String excelHeader = excelHeaders.get(excelIndex);
            
            // Find matching ColumnStructure by name
            ColumnStructure matchedColumn = expectedColumns.stream()
                    .filter(col -> col.getName().equals(excelHeader))
                    .findFirst()
                    .orElseThrow(() -> new ExcelProcessingException(
                            "Column mapping failed: Excel column '" + excelHeader + 
                            "' at position " + columnIndex + " not found in expected columns"));
            
            mapping.put(columnIndex, matchedColumn);
            log.debug("Mapped Excel column {} ({}) to ColumnStructure ({})", 
                    columnIndex, excelHeader, matchedColumn.getName());
        }
        
        return mapping;
    }
    
    /**
     * Create column configuration entities in Excel column order
     * This ensures columnConfigs[i] corresponds to Excel column[i]
     * 
     * @param productGroup Product group entity
     * @param excelColumnMapping Map of Excel column index to ColumnStructure
     * @return List of ColumnConfigs in Excel column order
     */
    private List<ColumnConfig> createColumnConfigs(ProductGroup productGroup, Map<Integer, ColumnStructure> excelColumnMapping) {
        List<ColumnConfig> columnConfigs = new ArrayList<>();
        
        // Sort by Excel column index to maintain order
        List<Integer> sortedIndices = new ArrayList<>(excelColumnMapping.keySet());
        Collections.sort(sortedIndices);
        
        for (int excelIndex : sortedIndices) {
            ColumnStructure columnStructure = excelColumnMapping.get(excelIndex);
            // columnOrder is 1-based, excelIndex is 0-based
            ColumnConfig columnConfig = ColumnConfig.builder()
                    .productGroup(productGroup)
                    .name(columnStructure.getName())
                    .dataType(columnStructure.getDataType())
                    .aboutColumn(columnStructure.getAboutColumn())
                    .isNullable(columnStructure.isNullable())
                    .comment(columnStructure.getComment())
                    .columnOrder(excelIndex + 1) // 1-based order
                    .build();
            
            columnConfigs.add(columnConfig);
        }
        
        return columnConfigs;
    }
    
    /**
     * Process product details from Excel rows
     */
    private List<ProductDetails> processProductDetails(ProductGroup productGroup, Sheet sheet, List<ColumnConfig> columnConfigs) {
        List<ProductDetails> productDetails = new ArrayList<>();
        
        // Process data rows (skip header row)
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row != null) {
                try {
                    ProductDetails productDetail = processRow(row, productGroup, columnConfigs, rowIndex);
                    productDetails.add(productDetail);
                } catch (Exception e) {
                    log.error("Error processing row {}: {}", rowIndex, e.getMessage());
                    throw new ExcelProcessingException("Failed to process row " + rowIndex + ": " + e.getMessage());
                }
            }
        }
        
        return productDetails;
    }
    
    /**
     * Process individual row and convert to product details
     * Uses column IDs as keys to ensure correct mapping
     * Note: columnConfigs must be in Excel column order (which is guaranteed by createColumnConfigs)
     */
    private ProductDetails processRow(Row row, ProductGroup productGroup, List<ColumnConfig> columnConfigs, int rowNumber) throws JsonProcessingException {
        Map<String, Object> rowData = new HashMap<>();
        
        for (int i = 0; i < columnConfigs.size(); i++) {
            ColumnConfig columnConfig = columnConfigs.get(i);
            Cell cell = row.getCell(i);
            Object value = convertCellValue(cell, columnConfig);
            
            // Use column ID as key (columnConfigs[i] corresponds to Excel column[i] due to mapping)
            if (columnConfig.getId() == null) {
                throw new ExcelProcessingException("Column ID is null for column: " + columnConfig.getName() + 
                        ". Columns must be saved before processing rows.");
            }
            rowData.put(columnConfig.getId().toString(), value);
        }
        
        String detailsJson = objectMapper.writeValueAsString(rowData);
        
        return ProductDetails.builder()
                .productGroup(productGroup)
                .details(detailsJson)
                .rowNumber(rowNumber)
                .build();
    }
    
    /**
     * Convert cell value based on expected data type
     */
    private Object convertCellValue(Cell cell, ColumnConfig columnConfig) {
        if (cell == null) {
            if (!columnConfig.isNullable()) {
                throw new ExcelProcessingException("Column " + columnConfig.getName() + " cannot be null");
            }
            return null;
        }
        
        try {
            switch (columnConfig.getDataType()) {
                case NUMBER:
                    return convertToNumber(cell);
                case BOOLEAN:
                    return convertToBoolean(cell);
                case STRING:
                default:
                    return getCellValueAsString(cell);
            }
        } catch (Exception e) {
            // Fallback to string if conversion fails
            log.warn("Failed to convert cell value for column {}: {}. Falling back to string.", 
                    columnConfig.getName(), e.getMessage());
            return getCellValueAsString(cell);
        }
    }
    
    /**
     * Convert cell to number
     */
    private Object convertToNumber(Cell cell) {
        switch (cell.getCellType()) {
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double numericValue = cell.getNumericCellValue();
                // Return as integer if it's a whole number
                if (numericValue == (long) numericValue) {
                    return (long) numericValue;
                }
                return numericValue;
            case STRING:
                String stringValue = cell.getStringCellValue().trim();
                if (stringValue.isEmpty()) return null;
                try {
                    return Double.parseDouble(stringValue);
                } catch (NumberFormatException e) {
                    return stringValue; // Fallback to string
                }
            default:
                return getCellValueAsString(cell);
        }
    }
    
    /**
     * Convert cell to boolean
     */
    private Object convertToBoolean(Cell cell) {
        switch (cell.getCellType()) {
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case STRING:
                String stringValue = cell.getStringCellValue().trim().toLowerCase();
                if (stringValue.isEmpty()) return null;
                if (stringValue.equals("true") || stringValue.equals("yes") || stringValue.equals("1") || stringValue.equals("y")) {
                    return true;
                } else if (stringValue.equals("false") || stringValue.equals("no") || stringValue.equals("0") || stringValue.equals("n")) {
                    return false;
                }
                return stringValue; // Fallback to string if not boolean
            case NUMERIC:
                double numericValue = cell.getNumericCellValue();
                if (numericValue == 1) return true;
                if (numericValue == 0) return false;
                return numericValue; // Fallback to number
            default:
                return getCellValueAsString(cell);
        }
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
    
    /**
     * Processing result DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class ProcessingResult {
        private boolean success;
        private Long productGroupId;
        private Integer rowsProcessed;
        private Integer columnsDetected;
        private String processingStatus;
        private String errorMessage;
    }
}




// 35.160.120.126
// 44.233.151.27
// 34.211.200.85
// 74.220.48.0/24
// 74.220.56.0/24
