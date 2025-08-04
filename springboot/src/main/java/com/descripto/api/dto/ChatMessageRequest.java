package com.descripto.api.dto;

import com.descripto.api.pojo.UserChatInput;
import lombok.Getter;
import lombok.Setter;

/**
 * @author krishna.meena
 */

@Setter
@Getter
public class ChatMessageRequest {
    private Integer tabid;
    private UserChatInput userChatInput;
}
