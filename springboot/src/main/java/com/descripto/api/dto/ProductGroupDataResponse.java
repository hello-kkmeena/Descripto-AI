package com.descripto.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for ProductGroup data with optional nested data
 * 
 * Contains:
 * - ProductGroup (always present)
 * - Columns (optional, only if includeColumns=true)
 * - Products (optional, only if includeProducts=true)
 * - Total (optional, only if includeProducts=true)
 * 
 * @author Descripto Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductGroupDataResponse {
    
    private ProductGroupResponse group;
    
    private List<ColumnConfigResponse> columns;
    
    private List<ProductDetailsResponse> products;
    
    private Long total; // Total products count, only present if includeProducts=true
}

