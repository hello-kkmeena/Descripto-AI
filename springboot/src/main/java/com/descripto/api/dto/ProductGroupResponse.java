package com.descripto.api.dto;

import com.descripto.api.model.ProductGroup;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO for ProductGroup
 * 
 * @author Descripto Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductGroupResponse {
    
    private Long id;
    
    private String name;
    
    private String fileName;
    
    private Integer numRows;
    
    private Integer numColumns;
    
    private Long fileSize;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant updatedAt;
    
    private String processingStatus;
    
    /**
     * Convert ProductGroup entity to ProductGroupResponse DTO
     */
    public static ProductGroupResponse fromEntity(ProductGroup productGroup) {
        if (productGroup == null) {
            return null;
        }
        
        return ProductGroupResponse.builder()
                .id(productGroup.getId())
                .name(productGroup.getName())
                .fileName(productGroup.getFileName())
                .numRows(productGroup.getNumRows())
                .numColumns(productGroup.getNumColumns())
                .fileSize(productGroup.getFileSize())
                .createdAt(productGroup.getCreatedAt())
                .updatedAt(productGroup.getUpdatedAt())
                .processingStatus(productGroup.getProcessingStatus() != null 
                    ? productGroup.getProcessingStatus().name() 
                    : null)
                .build();
    }
}

