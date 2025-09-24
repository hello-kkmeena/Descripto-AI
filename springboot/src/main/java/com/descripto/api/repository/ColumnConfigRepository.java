package com.descripto.api.repository;

import com.descripto.api.model.ColumnConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ColumnConfig entity
 * 
 * @author Descripto Team
 */
@Repository
public interface ColumnConfigRepository extends JpaRepository<ColumnConfig, Long> {
    
    /**
     * Find all columns for a product group ordered by column order
     */
    @Query("SELECT cc FROM ColumnConfig cc WHERE cc.productGroup.id = :productGroupId ORDER BY cc.columnOrder")
    List<ColumnConfig> findByProductGroupIdOrderByColumnOrder(@Param("productGroupId") Long productGroupId);
    
    /**
     * Find columns by product group and data type
     */
    @Query("SELECT cc FROM ColumnConfig cc WHERE cc.productGroup.id = :productGroupId AND cc.dataType = :dataType")
    List<ColumnConfig> findByProductGroupIdAndDataType(@Param("productGroupId") Long productGroupId, @Param("dataType") com.descripto.api.enums.ColumnDataType dataType);
    
    /**
     * Count columns for a product group
     */
    @Query("SELECT COUNT(cc) FROM ColumnConfig cc WHERE cc.productGroup.id = :productGroupId")
    long countByProductGroupId(@Param("productGroupId") Long productGroupId);
    
    /**
     * Find column by product group and name (exact match)
     */
    @Query("SELECT cc FROM ColumnConfig cc WHERE cc.productGroup.id = :productGroupId AND cc.name = :columnName")
    ColumnConfig findByProductGroupIdAndColumnName(@Param("productGroupId") Long productGroupId, @Param("columnName") String columnName);
}
