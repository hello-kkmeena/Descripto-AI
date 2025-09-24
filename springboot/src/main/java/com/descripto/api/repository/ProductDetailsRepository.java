package com.descripto.api.repository;

import com.descripto.api.model.ProductDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ProductDetails entity
 * 
 * @author Descripto Team
 */
@Repository
public interface ProductDetailsRepository extends JpaRepository<ProductDetails, Long> {
    
    /**
     * Find all products for a product group
     */
    @Query("SELECT pd FROM ProductDetails pd WHERE pd.productGroup.id = :productGroupId AND pd.isDeleted = false ORDER BY pd.rowNumber")
    List<ProductDetails> findByProductGroupIdAndIsDeletedFalseOrderByRowNumber(@Param("productGroupId") Long productGroupId);
    
    /**
     * Find products by product group with pagination
     */
    @Query("SELECT pd FROM ProductDetails pd WHERE pd.productGroup.id = :productGroupId AND pd.isDeleted = false ORDER BY pd.rowNumber")
    List<ProductDetails> findByProductGroupIdWithPagination(@Param("productGroupId") Long productGroupId, org.springframework.data.domain.Pageable pageable);
    
    /**
     * Count products for a product group
     */
    @Query("SELECT COUNT(pd) FROM ProductDetails pd WHERE pd.productGroup.id = :productGroupId AND pd.isDeleted = false")
    long countByProductGroupId(@Param("productGroupId") Long productGroupId);
    
    /**
     * Find products by row number range
     */
    @Query("SELECT pd FROM ProductDetails pd WHERE pd.productGroup.id = :productGroupId AND pd.rowNumber BETWEEN :startRow AND :endRow AND pd.isDeleted = false ORDER BY pd.rowNumber")
    List<ProductDetails> findByProductGroupIdAndRowNumberRange(@Param("productGroupId") Long productGroupId, @Param("startRow") Integer startRow, @Param("endRow") Integer endRow);
}
