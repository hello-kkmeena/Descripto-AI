package com.descripto.api.repository;

import com.descripto.api.model.Tab;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TabRepository extends JpaRepository<Tab, Integer> {
    Page<Tab> findByCreatedByAndIsActiveTrue(Integer userId, Pageable pageable);
}