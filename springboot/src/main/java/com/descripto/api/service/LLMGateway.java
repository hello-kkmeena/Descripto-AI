package com.descripto.api.service;

import com.descripto.api.interfaces.LLMInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author krishna.meena
 */

@Service
public class LLMGateway {

    public LLMInterface getGemini() {
        return GeminiLLM.getGemini();
    }



}
