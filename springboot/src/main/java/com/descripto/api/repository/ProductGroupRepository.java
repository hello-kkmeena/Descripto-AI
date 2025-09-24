package com.descripto.api.repository;

import com.descripto.api.model.ProductGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ProductGroup entity
 * 
 * @author Descripto Team
 */
@Repository
public interface ProductGroupRepository extends JpaRepository<ProductGroup, Long> {
    
    /**
     * Find product groups by created by user
     */
    @Query("SELECT pg FROM ProductGroup pg WHERE pg.createdBy = :createdBy AND pg.isDeleted = false ORDER BY pg.createdAt DESC")
    List<ProductGroup> findByCreatedByAndIsDeletedFalseOrderByCreatedAtDesc(@Param("createdBy") Long createdBy);
    
    /**
     * Find product group by name and created by user
     */
    @Query("SELECT pg FROM ProductGroup pg WHERE pg.name = :name AND pg.createdBy = :createdBy AND pg.isDeleted = false")
    Optional<ProductGroup> findByNameAndCreatedByAndIsDeletedFalse(@Param("name") String name, @Param("createdBy") Long createdBy);
    
    /**
     * Find active product groups by processing status
     */
    @Query("SELECT pg FROM ProductGroup pg WHERE pg.processingStatus = :status AND pg.isDeleted = false")
    List<ProductGroup> findByProcessingStatusAndIsDeletedFalse(@Param("status") ProductGroup.ProcessingStatus status);
    
    /**
     * Count product groups by user
     */
    @Query("SELECT COUNT(pg) FROM ProductGroup pg WHERE pg.createdBy = :userId AND pg.isDeleted = false")
    long countByUser(@Param("userId") Long userId);
    
    /**
     * Find product groups with pagination
     */
    @Query("SELECT pg FROM ProductGroup pg WHERE pg.createdBy = :userId AND pg.isDeleted = false ORDER BY pg.createdAt DESC")
    List<ProductGroup> findByUserWithPagination(@Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);
}
