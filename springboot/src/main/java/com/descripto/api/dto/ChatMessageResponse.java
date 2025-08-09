package com.descripto.api.dto;

import com.descripto.api.model.Tab;
import com.descripto.api.pojo.UserChatInput;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * @author krishna.meena
 */

@Builder
@Setter
@Getter
public class ChatMessageResponse {

    private UserChatInput userChatInput;

    private Tab tab;

    private String response;
}
