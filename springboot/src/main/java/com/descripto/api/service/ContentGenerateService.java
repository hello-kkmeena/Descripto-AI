package com.descripto.api.service;

import com.descripto.api.dto.*;
import com.descripto.api.exception.InvalidChatException;
import com.descripto.api.exception.ResourceNotFoundException;
import com.descripto.api.exception.UserException;
import com.descripto.api.model.Message;
import com.descripto.api.model.Tab;
import com.descripto.api.model.User;
import com.descripto.api.pojo.Tone;
import com.descripto.api.pojo.UserChatInput;
import com.descripto.api.repository.MessageRepository;
import com.descripto.api.repository.TabRepository;
import com.descripto.api.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

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
                    Keep under %s characters and SEO-friendly.
                    Return only the description, no other text,no formating.
                """;
       String finalPrompt =  String.format(prompt, 
                contentGenerationRequest.getProductName(),
                contentGenerationRequest.getProductFeature(),
                contentGenerationRequest.getTone().getName(),
                contentGenerationRequest.getCharCount()
            );

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
                    .charCount(chatMessageRequest.getUserChatInput().getCharCount())
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

            message.setActive(true);

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
                newTab.setActive(true);
                newTab = tabRepository.save(newTab);
            } else {
                // check with user access also
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

        if(chatMessageRequest.getUserChatInput().getCharCount() != null && chatMessageRequest.getUserChatInput().getCharCount() <= 0) {
            throw new InvalidChatException("Character count must be greater than 0");
        }

        return true;
    }

    public List<TabResponse> getTabs(int page, int size) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByEmailOrMobileNumber(username)
                .orElseThrow(() -> new UserException("User not found"));

        Pageable pagination = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Tab> tabPages =  tabRepository.findByCreatedByAndIsActiveTrue(user.getId(), pagination);
        return tabPages.getContent().stream()
                .map(tab -> TabResponse.builder()
                        .id(tab.getId())
                        .name(tab.getName())
                        .build())
                .toList();
    }

    public List<ChatMessageResponse> getMessages(Integer tabId, int page, int size) {

        // check this with current user also
        Tab tab = tabRepository.findById(tabId)
                .orElseThrow(() -> new ResourceNotFoundException("Tab not found with id: " + tabId));

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<Message> messages = messageRepository.findByTabIdAndIsActiveTrue(tabId, pageRequest);

        return messages.getContent().stream()
                .map(message -> ChatMessageResponse.builder()
                        .userChatInput(UserChatInput.builder()
                                .messageId(message.getId()+"")
                                .title(message.getTitle())
                                .feature(message.getFeature())
                                .tone(
                                        Tone.builder()
                                                .name(message.getTone())
                                                .build()
                                )
                                .build()
                        )
                        .response(message.getResponse())
                        .build())
                .collect(Collectors.toList());
    }
}
