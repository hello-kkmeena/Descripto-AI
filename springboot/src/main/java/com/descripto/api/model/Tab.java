package com.descripto.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author krishna.meena
 */

@Entity
@Table(name = "tab")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tab extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column
    private Integer createdBy;

    @Column
    private String name;

}
