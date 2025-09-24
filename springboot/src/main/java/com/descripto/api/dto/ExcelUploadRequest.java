package com.descripto.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * DTO for Excel file upload requests
 * 
 * @author Descripto Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelUploadRequest {
    
    /**
     * The Excel file to be processed
     */
    private MultipartFile file;
    
    /**
     * Flag indicating if the file has a predefined structure
     * - false: Auto-detect column structure from headers
     * - true: Use provided column structure for validation
     */
    private boolean structured;
    
    /**
     * List of column structures (required if structured=true)
     */
    private List<ColumnStructure> columns;
}
