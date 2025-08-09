package com.descripto.api.controller;

import com.descripto.api.dto.*;
import com.descripto.api.service.ContentGenerateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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

    @GetMapping("/chat/messages/{tabId}")
    @Operation(summary = "Get messages for a tab", description = "Fetches list of messages for a specific tab")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @Parameter(description = "ID of the tab", required = true)
            @PathVariable Integer tabId,
            @Parameter(description = "Page number (0-based)", required = true)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", required = true)
            @RequestParam(defaultValue = "20") int size) {

        List<ChatMessageResponse> tabsChats = contentGenerateService.getMessages(tabId,page,size);
        return ResponseEntity.ok(ApiResponse.<List<ChatMessageResponse>>builder()
                .success(true)
                .message("Messages retrieved successfully")
                .data(tabsChats)
                .build());
    }

    @GetMapping("/chat/tabs")
    @Operation(summary = "Get user's tabs", description = "Fetches list of all active tabs for the authenticated user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Tabs retrieved successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized - Authentication required",
            content = @Content
        )
    })
    public ResponseEntity<ApiResponse<List<TabResponse>>> getTabs(
            @Parameter(description = "Page number (0-based)", required = true)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", required = true)
            @RequestParam(defaultValue = "20") int size) {

        List<TabResponse> tabs = contentGenerateService.getTabs(page,size);
        return ResponseEntity.ok(ApiResponse.<List<TabResponse>>builder()
                .success(true)
                .message("Tabs retrieved successfully")
                .data(tabs)
                .build());
    }

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
