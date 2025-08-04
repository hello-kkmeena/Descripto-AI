package com.descripto.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageListResponse {
    private Integer id;
    private String messageId;
    private String content;
    private String response;
    private Instant createdAt;
    private String tone;
    private String feature;
    private String title;
}