package com.descripto.api.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.Map;

/**
 * Entity representing individual product details from Excel rows
 * 
 * @author Descripto Team
 */
@Entity
@Table(name = "product_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_group_id", nullable = false)
    private ProductGroup productGroup;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant createdAt;
    
    @Column(columnDefinition = "JSON", nullable = false)
    private String details; // JSON string of columnId: value mapping
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
    
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean isDeleted = false;
    
    @Column(name = "row_number")
    private Integer rowNumber;
    
    /**
     * Get product group ID for convenience
     */
    @Transient
    public Long getProductGroupId() {
        return productGroup != null ? productGroup.getId() : null;
    }
    
    /**
     * Get details as Map for easy access
     */
    @Transient
    public Map<String, Object> getDetailsAsMap() {
        // This would be implemented with ObjectMapper if needed
        return null;
    }
}



