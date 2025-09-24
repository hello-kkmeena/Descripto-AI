package com.descripto.api.service;

import com.descripto.api.enums.ColumnDataType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Service for inferring data types from Excel column data
 * 
 * @author Descripto Team
 */
@Service
@Slf4j
public class DataTypeInferenceService {
    
    // Patterns for data type detection
    private static final Pattern NUMERIC_PATTERN = Pattern.compile("^-?\\d+(\\.\\d+)?$");
    private static final Pattern BOOLEAN_PATTERN = Pattern.compile("^(true|false|yes|no|1|0|y|n)$", Pattern.CASE_INSENSITIVE);
    
    /**
     * Infer data type from a list of sample values
     * 
     * @param sampleValues List of sample values from the column
     * @return Inferred ColumnDataType
     */
    public ColumnDataType inferDataType(List<String> sampleValues) {
        if (sampleValues == null || sampleValues.isEmpty()) {
            return ColumnDataType.STRING; // Default to string if no data
        }
        
        int booleanCount = 0;
        int numericCount = 0;
        int stringCount = 0;
        
        for (String value : sampleValues) {
            if (value == null || value.trim().isEmpty()) {
                continue; // Skip null/empty values
            }
            
            String trimmedValue = value.trim();
            
            if (isBoolean(trimmedValue)) {
                booleanCount++;
            } else if (isNumeric(trimmedValue)) {
                numericCount++;
            } else {
                stringCount++;
            }
        }
        
        // Determine the most common type
        if (booleanCount > numericCount && booleanCount > stringCount) {
            return ColumnDataType.BOOLEAN;
        } else if (numericCount > stringCount) {
            return ColumnDataType.NUMBER;
        } else {
            return ColumnDataType.STRING;
        }
    }
    
    /**
     * Check if a value represents a boolean
     */
    private boolean isBoolean(String value) {
        return BOOLEAN_PATTERN.matcher(value).matches();
    }
    
    /**
     * Check if a value represents a number
     */
    private boolean isNumeric(String value) {
        return NUMERIC_PATTERN.matcher(value).matches();
    }
    
    /**
     * Generate a description about the column based on its data type
     */
    public String generateColumnDescription(ColumnDataType dataType, String columnName) {
        switch (dataType) {
            case BOOLEAN:
                return "Boolean field for " + columnName.toLowerCase().replace("_", " ");
            case NUMBER:
                return "Numeric field for " + columnName.toLowerCase().replace("_", " ");
            case STRING:
            default:
                return "Text field for " + columnName.toLowerCase().replace("_", " ");
        }
    }
}
