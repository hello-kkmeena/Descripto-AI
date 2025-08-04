package com.descripto.api.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * @author krishna.meena
 */
@Builder
@Setter
@Getter
public class ContentGenerationResponse {
    private String content;
}
