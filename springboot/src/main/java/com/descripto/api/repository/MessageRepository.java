package com.descripto.api.repository;

import com.descripto.api.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author krishna.meena
 */
public interface MessageRepository extends JpaRepository<Message, Long> {

}
