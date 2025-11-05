package com.descripto.api.dto;

import com.descripto.api.model.ProductDetails;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO for ProductDetails
 * 
 * @author Descripto Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailsResponse {
    
    private Long id;
    
    private Long productGroupId;
    
    private Integer rowNumber;
    
    private String details; // JSON string of columnId: value mapping (kept as string for frontend compatibility)
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant createdAt;
    
    /**
     * Convert ProductDetails entity to ProductDetailsResponse DTO
     * Keeps details as JSON string for frontend compatibility
     */
    public static ProductDetailsResponse fromEntity(ProductDetails productDetails) {
        if (productDetails == null) {
            return null;
        }
        
        return ProductDetailsResponse.builder()
                .id(productDetails.getId())
                .productGroupId(productDetails.getProductGroupId())
                .rowNumber(productDetails.getRowNumber())
                .details(productDetails.getDetails()) // Keep as JSON string
                .createdAt(productDetails.getCreatedAt())
                .build();
    }
}

