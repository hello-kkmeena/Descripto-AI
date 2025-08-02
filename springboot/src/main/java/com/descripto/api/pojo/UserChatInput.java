package com.descripto.api.pojo;

import lombok.Getter;
import lombok.Setter;

/**
 * @author krishna.meena
 */

@Setter
@Getter
public class UserChatInput {

    private String messageId;
    private String title;
    private Tone tone;
    private String feature;
}
