package com.descripto.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for Excel file processing responses
 * 
 * @author Descripto Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelUploadResponse {
    
    /**
     * Whether the processing was successful
     */
    private boolean success;
    
    /**
     * Response message
     */
    private String message;
    
    /**
     * List of detected column structures (for unstructured mode)
     */
    private List<ColumnStructure> columnStructures;
    
    /**
     * Number of rows processed
     */
    private Integer rowsProcessed;
    
    /**
     * Number of columns detected
     */
    private Integer columnsDetected;
    
    /**
     * Any errors encountered during processing
     */
    private List<String> errors;
    
    /**
     * Product group ID (for structured mode when data is saved)
     */
    private Long productGroupId;
    
    /**
     * Processing status (for structured mode)
     */
    private String processingStatus;
}
