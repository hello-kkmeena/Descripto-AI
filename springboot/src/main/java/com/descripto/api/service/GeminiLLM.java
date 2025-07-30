package com.descripto.api.service;

import com.descripto.api.exception.LLMGatewayException;
import com.descripto.api.interfaces.LLMInterface;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

/**
 * @author krishna.meena
 */

@Slf4j
public class GeminiLLM implements LLMInterface {

//    models/gemini-2.0-flash-lite

    private static GeminiLLM geminiLLM = null;

    private GeminiLLM() {
    }

    public static synchronized LLMInterface getGemini() {
        if(geminiLLM == null) {
            geminiLLM = new GeminiLLM();
        }
        return geminiLLM;
    }

    private static final String geminiApiUrl =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
    private static final String geminiApiKey="AIzaSyA5hhoIJCQcjXRxYs5uMl-FZ3HQY--lnb0";

    private final WebClient webClient = WebClient.create();

    @Override
    public String callme(String prompt) throws LLMGatewayException {

        try {

            log.debug("prompt : "+ prompt);

            String fullUrl = geminiApiUrl + "?key=" + geminiApiKey;

            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[]{
                            Map.of("parts", new Object[]{Map.of("text", prompt)})
                    }
            );

            Map<String, Object> response = webClient.post()
                    .uri(fullUrl)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            // Extract response text
            Object candidates = response.get("candidates");
            if (candidates instanceof Iterable<?> iterable) {
                for (Object candidate : iterable) {
                    Map<?, ?> candMap = (Map<?, ?>) candidate;
                    Map<?, ?> content = (Map<?, ?>) candMap.get("content");
                    Object parts = content.get("parts");
                    if (parts instanceof Iterable<?> partsList) {
                        for (Object part : partsList) {
                            Map<?, ?> partMap = (Map<?, ?>) part;
                            return partMap.get("text").toString();
                        }
                    }
                }
            }


            return "No response from Gemini.";


        } catch (Exception e) {
            log.warn("Error while calling gemini message: {}", e.getMessage());
            throw new LLMGatewayException(e.getMessage(), e);
        }
    }
}
