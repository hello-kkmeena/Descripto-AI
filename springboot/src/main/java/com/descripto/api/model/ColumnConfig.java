package com.descripto.api.model;

import com.descripto.api.enums.ColumnDataType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing column configuration for a product group
 * 
 * @author Descripto Team
 */
@Entity
@Table(name = "column_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColumnConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_group_id", nullable = false)
    private ProductGroup productGroup;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    private ColumnDataType dataType;
    
    @Column(name = "about_column", columnDefinition = "TEXT")
    private String aboutColumn;
    
    @Column(name = "is_nullable", nullable = false)
    @Builder.Default
    private boolean isNullable = true;
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "column_order", nullable = false)
    private Integer columnOrder;
    
    /**
     * Get product group ID for convenience
     */
    @Transient
    public Long getProductGroupId() {
        return productGroup != null ? productGroup.getId() : null;
    }
}

