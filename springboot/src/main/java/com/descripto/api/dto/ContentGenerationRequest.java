package com.descripto.api.dto;

import com.descripto.api.pojo.Tone;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * @author krishna.meena
 */

@Setter
@Getter
@Builder
public class ContentGenerationRequest {

    private String productName;

    private String productFeature;

    private Tone tone;
}
