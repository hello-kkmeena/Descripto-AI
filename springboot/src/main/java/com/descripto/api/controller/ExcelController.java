package com.descripto.api.controller;

import com.descripto.api.dto.ApiResponse;
import com.descripto.api.dto.ColumnStructure;
import com.descripto.api.dto.ExcelUploadResponse;
import com.descripto.api.dto.ProductGroupResponse;
import com.descripto.api.dto.ProductGroupDataResponse;
import com.descripto.api.service.ExcelProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller for Excel file processing operations
 * 
 * @author Descripto Team
 */
@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
@Tag(name = "Excel Processing", description = "API for processing Excel files")
@Slf4j
public class ExcelController {
    
    private final ExcelProcessingService excelProcessingService;
    
    /**
     * Process Excel file with structured/unstructured mode
     * 
     * @param file Excel file to process
     * @param structured Whether the file has predefined structure
     * @param columns Expected column structure (required if structured=true)
     * @return Processing result
     */
    @PostMapping(value = "/process", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Process Excel file",
        description = "Process Excel file in structured or unstructured mode. " +
                     "If structured=true, provide column structure. " +
                     "If structured=false, column structure will be auto-detected."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Excel file processed successfully",
            content = @Content(schema = @Schema(implementation = ExcelUploadResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid file or request parameters",
            content = @Content
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error during processing",
            content = @Content
        )
    })
    public ResponseEntity<ApiResponse<ExcelUploadResponse>> processExcel(
            @Parameter(description = "Excel file (.xlsx or .xls)", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Processing mode: true for structured, false for auto-detection", required = true)
            @RequestParam("structured") boolean structured,
            @Parameter(description = "Expected column structure (required if structured=true)")
            @RequestParam(value = "columns", required = false) String columns) {
        
        log.info("Received Excel processing request: file={}, structured={}", 
                file.getOriginalFilename(), structured);
        
        try {
            List<ColumnStructure> columnStructures = null;
            
            // Parse columns JSON if structured mode is enabled
            if (structured && columns != null && !columns.trim().isEmpty()) {
                // Note: In a real implementation, you'd use ObjectMapper to parse JSON
                // For now, we'll handle this in the service
                log.warn("Column structure parsing not implemented yet. Using null.");
            }
            
            ExcelUploadResponse response = excelProcessingService.processExcelFile(
                    file, structured, columns);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
            } else {
                // Join multiple errors into a single string for ApiResponse
                String errorMessage = response.getErrors() != null && !response.getErrors().isEmpty() 
                    ? String.join("; ", response.getErrors()) 
                    : response.getMessage();
                return ResponseEntity.badRequest().body(ApiResponse.error(errorMessage));
            }
            
        } catch (Exception e) {
            log.error("Error processing Excel file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }
    
    /**
     * Health check endpoint for Excel processing service
     */
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if Excel processing service is running")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Excel processing service is running", "Service healthy"));
    }
    
    /**
     * Get product groups for authenticated user with pagination
     * 
     * @param page Page number (0-based, default: 0)
     * @param size Page size (default: 20)
     * @return Page of ProductGroupResponse
     */
    @GetMapping("/groups")
    @Operation(
        summary = "Get product groups",
        description = "Retrieve paginated list of Excel files (product groups) uploaded by the authenticated user"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Product groups retrieved successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized - Authentication required",
            content = @Content
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content
        )
    })
    public ResponseEntity<ApiResponse<Page<ProductGroupResponse>>> getProductGroups(
            @Parameter(description = "Page number (0-based)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", required = false)
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Received request to fetch product groups: page={}, size={}", page, size);
        
        try {
            Page<ProductGroupResponse> productGroups = excelProcessingService.getUserProductGroups(page, size);
            
            return ResponseEntity.ok(ApiResponse.success(productGroups, "Product groups retrieved successfully"));
            
        } catch (Exception e) {
            log.error("Error fetching product groups: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch product groups: " + e.getMessage()));
        }
    }
    
    /**
     * Get product group data with optional columns and products
     * 
     * @param id Product group ID
     * @param includeColumns Whether to include column configs (default: false)
     * @param includeProducts Whether to include product details (default: false)
     * @param page Page number for products (0-based, default: 0)
     * @param size Page size for products (default: 50)
     * @return ProductGroupDataResponse with optional nested data
     */
    @GetMapping("/groups/{id}")
    @Operation(
        summary = "Get product group data",
        description = "Retrieve product group details with optional columns and products. " +
                     "Use includeColumns=true to get column configurations. " +
                     "Use includeProducts=true to get product data with pagination."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Product group data retrieved successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized - Authentication required",
            content = @Content
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Product group not found",
            content = @Content
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Forbidden - Product group does not belong to user",
            content = @Content
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content
        )
    })
    public ResponseEntity<ApiResponse<ProductGroupDataResponse>> getProductGroupData(
            @Parameter(description = "Product group ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Include column configurations", required = false)
            @RequestParam(defaultValue = "false") boolean includeColumns,
            @Parameter(description = "Include product details", required = false)
            @RequestParam(defaultValue = "false") boolean includeProducts,
            @Parameter(description = "Page number for products (0-based)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size for products", required = false)
            @RequestParam(defaultValue = "50") int size) {
        
        log.info("Received request to fetch product group data: id={}, includeColumns={}, includeProducts={}, page={}, size={}", 
                id, includeColumns, includeProducts, page, size);
        
        try {
            ProductGroupDataResponse data = excelProcessingService.getProductGroupData(
                    id, includeColumns, includeProducts, page, size);
            
            return ResponseEntity.ok(ApiResponse.success(data, "Product group data retrieved successfully"));
            
        } catch (com.descripto.api.exception.ResourceNotFoundException e) {
            log.warn("Product group not found: {}", id);
            return ResponseEntity.notFound()
                    .build();
        } catch (com.descripto.api.exception.ExcelProcessingException e) {
            if (e.getMessage().contains("Access denied")) {
                log.warn("Access denied for product group {}: {}", id, e.getMessage());
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(e.getMessage()));
            }
            log.error("Error fetching product group data: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching product group data: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch product group data: " + e.getMessage()));
        }
    }
}
