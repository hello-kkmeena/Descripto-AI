package com.descripto.api.controller;

import com.descripto.api.dto.*;
import com.descripto.api.service.ContentGenerateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * @author krishna.meena
 */

@RestController
@RequestMapping("/generate")
@Tag(name = "Content Generation", description = "API related to content generation here")
@Slf4j
public class ContentController {

    @Autowired private ContentGenerateService contentGenerateService;

    @PostMapping("/description")
    @Operation(summary = "generate description",
            description = "get production description from feature, title and tone")
    public ResponseEntity<ApiResponse<Object>> generate(
            @RequestBody ContentGenerationRequest contentGenerationRequest) {
        ContentGenerationResponse contentGenerationResponse =
                contentGenerateService.generate(contentGenerationRequest);
        return ResponseEntity.ok().body(ApiResponse.success(contentGenerationResponse,
                "Content Generated successfully"));

    }


    @PostMapping("agent")
    public ResponseEntity<ApiResponse<Object>> generateAgent(
            @RequestBody ContentGenerationRequest contentGenerationRequest ) {
        Map<String,Object> map= new HashMap<>();
        map.put("id",1);
        return ResponseEntity.ok().body(ApiResponse.success(map,
                "Content Generated successfully"));
    }


    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> doChat(@RequestBody ChatMessageRequest chatMessageRequest) {

        ChatMessageResponse response = contentGenerateService.doChat(chatMessageRequest);

        return ResponseEntity.ok().body(ApiResponse.success(response,
                "Chat Completed successfully"));
    }





}
