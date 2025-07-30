package com.descripto.api.service;

import com.descripto.api.dto.ContentGenerationRequest;
import com.descripto.api.dto.ContentGenerationResponse;
import com.descripto.api.interfaces.LLMInterface;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author krishna.meena
 */

@Service
@Slf4j
public class ContentGenerateService {

    @Autowired private LLMGateway llmGateway;



    public ContentGenerationResponse generate(ContentGenerationRequest contentGenerationRequest) {

        String prompt = """
                Write a persuasive E-commerce product descriptions for:
                    Title: %s
                    Features: %s
                    Tone: %s
                    Keep under 300 characters and SEO-friendly.
                    Return only the description, no other text,no formating.
                """;
       String finalPrompt =  String.format(prompt, contentGenerationRequest.getProductName(),
                contentGenerationRequest.getProductFeature(),contentGenerationRequest.getTone().getName());

        String response = llmGateway.getGemini().callme(finalPrompt);

        return  ContentGenerationResponse.builder().content(response).build();

    }
}
