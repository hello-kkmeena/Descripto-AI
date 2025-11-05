package com.descripto.api.service;

import com.descripto.api.Constant;
import com.descripto.api.dto.ColumnStructure;
import com.descripto.api.dto.ExcelUploadResponse;
import com.descripto.api.dto.ProductGroupResponse;
import com.descripto.api.dto.ProductGroupDataResponse;
import com.descripto.api.dto.ColumnConfigResponse;
import com.descripto.api.dto.ProductDetailsResponse;
import com.descripto.api.exception.ExcelProcessingException;
import com.descripto.api.exception.ResourceNotFoundException;
import com.descripto.api.exception.UserException;
import com.descripto.api.model.ProductGroup;
import com.descripto.api.model.User;
import com.descripto.api.model.ColumnConfig;
import com.descripto.api.model.ProductDetails;
import com.descripto.api.repository.ProductGroupRepository;
import com.descripto.api.repository.UserRepository;
import com.descripto.api.repository.ColumnConfigRepository;
import com.descripto.api.repository.ProductDetailsRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

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
    private final ProductGroupRepository productGroupRepository;
    private final UserRepository userRepository;
    private final ColumnConfigRepository columnConfigRepository;
    private final ProductDetailsRepository productDetailsRepository;
    
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
    
    /**
     * Get product groups for authenticated user with pagination
     * 
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of ProductGroupResponse
     */
    public Page<ProductGroupResponse> getUserProductGroups(int page, int size) {
        // Get authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ExcelProcessingException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByEmailOrMobileNumber(username)
                .orElseThrow(() -> new UserException("User not found"));
        
        // Convert Integer userId to Long for ProductGroup
        Long userId = 1l;
        
        // Create pageable with sorting by createdAt DESC
        Pageable pageable = PageRequest.of(page, size);
        
        // Fetch product groups
        List<ProductGroup> productGroups = productGroupRepository.findByUserWithPagination(userId, pageable);
        
        // Convert to Page<ProductGroupResponse>
        List<ProductGroupResponse> responseList = productGroups.stream()
                .map(ProductGroupResponse::fromEntity)
                .collect(Collectors.toList());
        
        // Get total count
        long total = productGroupRepository.countByUser(userId);
        
        // Create Page object manually since repository returns List
        Page<ProductGroupResponse> pageResponse = new org.springframework.data.domain.PageImpl<>(
                responseList,
                pageable,
                total
        );
        
        log.info("Retrieved {} product groups for user {} (page {}, size {})", 
                responseList.size(), username, page, size);
        
        return pageResponse;
    }
    
    /**
     * Get product group data with optional columns and products
     * 
     * @param groupId Product group ID
     * @param includeColumns Whether to include column configs
     * @param includeProducts Whether to include product details
     * @param page Page number for products (0-based)
     * @param size Page size for products
     * @return ProductGroupDataResponse with optional nested data
     */
    public ProductGroupDataResponse getProductGroupData(
            Long groupId, 
            boolean includeColumns, 
            boolean includeProducts, 
            int page, 
            int size) {
        
        // Get authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ExcelProcessingException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByEmailOrMobileNumber(username)
                .orElseThrow(() -> new UserException("User not found"));
        
        Long userId = 1l;
        
        // Fetch and verify product group ownership
        ProductGroup productGroup = productGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Product group not found with id: " + groupId));
        
        // Verify user owns the product group
        if (!productGroup.getCreatedBy().equals(userId)) {
            throw new ExcelProcessingException("Access denied: Product group does not belong to user");
        }
        
        // Build response
        ProductGroupDataResponse.ProductGroupDataResponseBuilder responseBuilder = ProductGroupDataResponse.builder()
                .group(ProductGroupResponse.fromEntity(productGroup));
        
        // Add columns if requested
        if (includeColumns) {
            List<ColumnConfig> columns = columnConfigRepository.findByProductGroupIdOrderByColumnOrder(groupId);
            List<ColumnConfigResponse> columnResponses = columns.stream()
                    .map(ColumnConfigResponse::fromEntity)
                    .collect(Collectors.toList());
            responseBuilder.columns(columnResponses);
            
            log.debug("Retrieved {} columns for product group {}", columnResponses.size(), groupId);
        }
        
        // Add products if requested
        if (includeProducts) {
            Pageable pageable = PageRequest.of(page, size);
            List<ProductDetails> products = productDetailsRepository.findByProductGroupIdWithPagination(groupId, pageable);
            
            // Calculate total count - only needed when fetching products for pagination
            // Total is required for frontend pagination controls
            long total = productDetailsRepository.countByProductGroupId(groupId);
            
            List<ProductDetailsResponse> productResponses = products.stream()
                    .map(ProductDetailsResponse::fromEntity)
                    .collect(Collectors.toList());
            
            responseBuilder.products(productResponses);
            responseBuilder.total(total); // Total count for pagination
            
            log.debug("Retrieved {} products for product group {} (page {}, size {}, total {})", 
                    productResponses.size(), groupId, page, size, total);
        }
        
        log.info("Retrieved product group data for id {} (includeColumns: {}, includeProducts: {})", 
                groupId, includeColumns, includeProducts);
        
        return responseBuilder.build();
    }
}
