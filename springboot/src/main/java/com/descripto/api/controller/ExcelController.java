package com.descripto.api.controller;

import com.descripto.api.dto.ApiResponse;
import com.descripto.api.dto.ColumnStructure;
import com.descripto.api.dto.ExcelUploadResponse;
import com.descripto.api.service.ExcelProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
}
