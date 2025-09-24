package com.descripto.api.dto;

import com.descripto.api.enums.ColumnDataType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * POJO representing the structure of an Excel column
 * 
 * @author Descripto Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColumnStructure {
    
    /**
     * Name/header of the column
     */
    private String name;
    
    /**
     * Data type of the column
     */
    private ColumnDataType dataType;
    
    /**
     * Description about what the column represents
     */
    private String aboutColumn;
    
    /**
     * Whether the column can contain null values
     */
    private boolean isNullable;
    
    /**
     * Additional comments about the column
     */
    private String comment;
}
