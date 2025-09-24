package com.descripto.api.service;

import com.descripto.api.Constant;
import com.descripto.api.dto.ColumnStructure;
import com.descripto.api.dto.ExcelUploadResponse;
import com.descripto.api.exception.ExcelProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Main service for processing Excel files
 * 
 * @author Descripto Team
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelProcessingService {
    
    private final ColumnStructureService columnStructureService;
    private final ProductGroupDataProcessor productGroupDataProcessor;
    
    /**
     * Process Excel file based on structured flag
     * 
     * @param file Excel file to process
     * @param structured Whether the file has predefined structure
     * @param columns JSON string of column structure (required if structured=true)
     * @return ExcelUploadResponse with processing results
     */
    public ExcelUploadResponse processExcelFile(MultipartFile file, boolean structured, String columns) {
        log.info("Processing Excel file: {} (structured: {})", file.getOriginalFilename(), structured);
        
        try {
            // Validate file
            validateFile(file);
            
            // Process file based on structured flag
            if (structured) {
                return processStructuredFile(file, columns);
            } else {
                return processUnstructuredFile(file);
            }
            
        } catch (Exception e) {
            log.error("Error processing Excel file: {}", e.getMessage(), e);
            return ExcelUploadResponse.builder()
                    .success(false)
                    .message("Error processing Excel file: " + e.getMessage())
                    .errors(List.of(e.getMessage()))
                    .build();
        }
    }
    
    /**
     * Process unstructured Excel file (auto-detect column structure)
     */
    private ExcelUploadResponse processUnstructuredFile(MultipartFile file) throws IOException {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            List<ColumnStructure> columnStructures = columnStructureService.detectColumnStructure(workbook);
            
            int rowCount = workbook.getSheetAt(0).getPhysicalNumberOfRows() - 1; // Exclude header
            
            return ExcelUploadResponse.builder()
                    .success(true)
                    .message("Column structure detected successfully")
                    .columnStructures(columnStructures)
                    .rowsProcessed(rowCount)
                    .columnsDetected(columnStructures.size())
                    .build();
        }
    }
    
    /**
     * Process structured Excel file (validate against provided structure)
     */
    private ExcelUploadResponse processStructuredFile(MultipartFile file, String columns) throws IOException {
        if (columns == null || columns.trim().isEmpty()) {
            throw new ExcelProcessingException("Column structure is required for structured processing");
        }
        
        // Convert JSON string to ColumnStructure objects
        List<ColumnStructure> expectedColumns = parseColumnStructure(columns);
        if (expectedColumns.isEmpty()) {
            throw new ExcelProcessingException("Invalid column structure format");
        }
        
        // Get authenticated user ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ExcelProcessingException("User not authenticated");
        }
        
        // Extract user ID from authentication (assuming it's stored as user ID)
        Long userId = 1l;
        
        try {
            // Process and store data using ProductGroupDataProcessor
            ProductGroupDataProcessor.ProcessingResult result = productGroupDataProcessor.processAndStoreExcelData(
                    file, expectedColumns, userId);
            
            return ExcelUploadResponse.builder()
                    .success(true)
                    .message("Excel file processed and saved successfully")
                    .rowsProcessed(result.getRowsProcessed())
                    .columnsDetected(result.getColumnsDetected())
                    .productGroupId(result.getProductGroupId())
                    .processingStatus(result.getProcessingStatus())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error processing structured Excel file: {}", e.getMessage(), e);
            return ExcelUploadResponse.builder()
                    .success(false)
                    .message("Excel processing failed: " + e.getMessage())
                    .errors(List.of(e.getMessage()))
                    .build();
        }
    }
    
    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ExcelProcessingException("File is empty or null");
        }
        
        if (file.getSize() > Constant.MAX_FILE_SIZE) {
            throw new ExcelProcessingException("File size exceeds maximum limit of 25 MB");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !hasValidExtension(originalFilename)) {
            throw new ExcelProcessingException("Invalid file type. Only .xlsx and .xls files are allowed");
        }
    }
    
    /**
     * Check if file has valid Excel extension
     */
    private boolean hasValidExtension(String filename) {
        String lowercaseFilename = filename.toLowerCase();
        return Constant.ALLOWED_EXTENSIONS.stream().anyMatch(lowercaseFilename::endsWith);
    }
    
    /**
     * Parse JSON string to ColumnStructure objects
     */
    private List<ColumnStructure> parseColumnStructure(String columnsJson) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(columnsJson, new TypeReference<List<ColumnStructure>>() {});
        } catch (Exception e) {
            log.error("Error parsing column structure JSON: {}", e.getMessage(), e);
            throw new ExcelProcessingException("Invalid column structure format: " + e.getMessage());
        }
    }
}
