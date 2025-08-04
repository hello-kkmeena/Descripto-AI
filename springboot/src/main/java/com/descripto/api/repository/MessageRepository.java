package com.descripto.api.repository;

import com.descripto.api.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    Page<Message> findByTabIdAndIsActiveTrue(Integer tabId, Pageable pageable);
}