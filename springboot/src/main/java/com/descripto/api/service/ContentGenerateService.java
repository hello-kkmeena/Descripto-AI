package com.descripto.api.service;

import com.descripto.api.dto.ChatMessageRequest;
import com.descripto.api.dto.ChatMessageResponse;
import com.descripto.api.dto.ContentGenerationRequest;
import com.descripto.api.dto.ContentGenerationResponse;
import com.descripto.api.exception.InvalidChatException;
import com.descripto.api.exception.UserException;
import com.descripto.api.model.Message;
import com.descripto.api.model.Tab;
import com.descripto.api.model.User;
import com.descripto.api.repository.MessageRepository;
import com.descripto.api.repository.TabRepository;
import com.descripto.api.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * @author krishna.meena
 */

@Service
@Slf4j
public class ContentGenerateService {

    @Autowired private LLMGateway llmGateway;

    @Autowired private UserRepository userRepository;

    @Autowired private MessageRepository messageRepository;

    @Autowired private TabRepository tabRepository;



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

    public ChatMessageResponse doChat(ChatMessageRequest chatMessageRequest) {

        try {
            // validate user input

            isValidChatRequest(chatMessageRequest);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userRepository.findByEmailOrMobileNumber(username)
                    .orElseThrow(() -> new UserException("User not found"));
            // check to create tab

            Tab tab = getOrCreateTab(chatMessageRequest,user);

            // 4. Generate content using existing method
            ContentGenerationRequest genRequest = ContentGenerationRequest.builder()
                    .productName(chatMessageRequest.getUserChatInput().getTitle())
                    .productFeature(chatMessageRequest.getUserChatInput().getFeature())
                    .tone(chatMessageRequest.getUserChatInput().getTone())
                    .build();

            ContentGenerationResponse genResponse = generate(genRequest);


            // 5. Create and save message
            Message message = Message.builder()
                    .tabId(tab.getId())
                    .userId(user.getId())
                    .title(chatMessageRequest.getUserChatInput().getTitle())
                    .feature(chatMessageRequest.getUserChatInput().getFeature())
                    .tone(chatMessageRequest.getUserChatInput().getTone().getName())
                    .response(genResponse.getContent())
                    .build();

            messageRepository.save(message);

            // 6. Return response
            return ChatMessageResponse.builder()
                    .tab(tab)
                    .userChatInput(chatMessageRequest.getUserChatInput())
                    .response(genResponse.getContent())
                    .build();
            // check user access

            //
        } catch (Exception e) {

            log.error("error in chat compilation, message : {}",e.getMessage());
        }

        return null;
    }

    private Tab getOrCreateTab(ChatMessageRequest request, User user) {

        try {
            String tabName = request.getUserChatInput().getTitle() +
                    "_" +
                    request.getUserChatInput().getTone().getName();
            Tab newTab;
            Integer tabId = request.getTabid();
            if (tabId == null || tabId == 0) {
                newTab = Tab.builder()
                        .name(tabName)
                        .createdBy(user.getId())
                        .build();
                newTab = tabRepository.save(newTab);
            } else {
                newTab = tabRepository.findById(tabId).orElseThrow();
            }
            return newTab;
        } catch (Exception e) {
            log.error("inavlid tab id message : {}", e.getMessage());
            throw new InvalidChatException("invalid chatId");
        }

    }

    private boolean isValidChatRequest(ChatMessageRequest chatMessageRequest) throws InvalidChatException {

        if (chatMessageRequest.getUserChatInput() == null) {
            throw new InvalidChatException("No user Input found");
        }

        if (chatMessageRequest.getUserChatInput() == null) {
            throw new InvalidChatException("No user Input found");
        }

        if (StringUtils.isEmpty(chatMessageRequest.getUserChatInput().getTitle())) {
            throw new InvalidChatException("Title not found in User Input");
        }

        if (StringUtils.isEmpty(chatMessageRequest.getUserChatInput().getFeature())) {
            throw new InvalidChatException("feature not found in User Input");
        }

        if(chatMessageRequest.getUserChatInput().getTone() == null || StringUtils.isEmpty(chatMessageRequest.getUserChatInput().getTone().getName()) ) {
            throw new InvalidChatException("Tone not found for Message");
        }


        return true;
    }
}
