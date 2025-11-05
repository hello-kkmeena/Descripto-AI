package com.descripto.api.dto;

import com.descripto.api.model.ColumnConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for ColumnConfig
 * 
 * @author Descripto Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColumnConfigResponse {
    
    private Long id;
    
    private String name;
    
    private String dataType;
    
    private String aboutColumn;
    
    private Boolean isNullable;
    
    private String comment;
    
    private Integer columnOrder;
    
    /**
     * Convert ColumnConfig entity to ColumnConfigResponse DTO
     */
    public static ColumnConfigResponse fromEntity(ColumnConfig columnConfig) {
        if (columnConfig == null) {
            return null;
        }
        
        return ColumnConfigResponse.builder()
                .id(columnConfig.getId())
                .name(columnConfig.getName())
                .dataType(columnConfig.getDataType() != null ? columnConfig.getDataType().name() : null)
                .aboutColumn(columnConfig.getAboutColumn())
                .isNullable(columnConfig.isNullable())
                .comment(columnConfig.getComment())
                .columnOrder(columnConfig.getColumnOrder())
                .build();
    }
}

