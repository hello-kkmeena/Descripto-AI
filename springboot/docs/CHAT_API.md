# Chat Generation API Documentation

## Overview
The Chat Generation API provides AI-powered content generation with conversation management through tabs. It supports both single-message and continuous chat interactions.

## Endpoint Details
- **URL**: `/api/v1/generate/chat`
- **Method**: `POST`
- **Authentication**: Required (Bearer Token)

## Request Format

```json
{
    "tabid": number | null,     // Optional. Used for continuing conversations
    "userChatInput": {
        "messageId": string,    // Optional for first message, required for follow-ups
        "title": string,        // Required. Subject/topic of the message
        "tone": {
            "id": number,       // Tone identifier
            "name": string      // Required. e.g., "professional", "casual"
        },
        "feature": string       // Required. Content to generate response for
    }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tabid | number | No | Tab identifier for continuing conversations. If not provided, creates new tab |
| messageId | string | No* | Message identifier. Optional for first message, required for follow-ups |
| title | string | Yes | Subject or topic of the message |
| tone.name | string | Yes | Desired tone for response (e.g., "professional") |
| feature | string | Yes | Main content for which response is generated |

*messageId is optional for the first message in a conversation but required for subsequent messages.

## Response Format

```json
{
    "success": true,
    "message": "Chat Completed successfully",
    "data": {
        "userChatInput": {
            "messageId": string,
            "title": string,
            "tone": {
                "id": number,
                "name": string
            },
            "feature": string
        },
        "tab": {
            "id": number,
            "name": string,
            "createdBy": number,
            "createdAt": string,
            "updatedAt": string,
            "deletedOn": null,
            "isActive": true
        },
        "response": string
    },
    "timestamp": string,
    "statusCode": number
}
```

## Example Usage

### New Conversation Request
```json
{
    "userChatInput": {
        "title": "Smart Watch Description",
        "tone": {
            "id": 1,
            "name": "professional"
        },
        "feature": "Advanced fitness tracker with heart rate monitoring and sleep analysis"
    }
}
```

### Follow-up Message Request
```json
{
    "tabid": 123,
    "userChatInput": {
        "messageId": "msg_456",
        "title": "Smart Watch Description",
        "tone": {
            "id": 1,
            "name": "professional"
        },
        "feature": "Add information about water resistance and battery life"
    }
}
```

### Success Response
```json
{
    "success": true,
    "message": "Chat Completed successfully",
    "data": {
        "userChatInput": {
            "title": "Smart Watch Description",
            "tone": {
                "id": 1,
                "name": "professional"
            },
            "feature": "Advanced fitness tracker..."
        },
        "tab": {
            "id": 123,
            "name": "Smart Watch Description_professional",
            "createdBy": 456,
            "createdAt": "2025-08-03T01:23:45.678Z",
            "updatedAt": "2025-08-03T01:23:45.678Z",
            "deletedOn": null,
            "isActive": true
        },
        "response": "Experience precision health monitoring with our advanced fitness tracker..."
    },
    "timestamp": "2025-08-03T01:23:45.678Z",
    "statusCode": 0
}
```

## Error Responses

### 401 Unauthorized
```json
{
    "path": "/api/v1/generate/chat",
    "error": "Unauthorized",
    "message": "Full authentication is required to access this resource",
    "status": 401
}
```

### 400 Bad Request
```json
{
    "success": false,
    "message": "Invalid chat request",
    "error": {
        "code": "VALIDATION_ERROR",
        "details": "Title not found in User Input"
    }
}
```

## Business Rules

### Tab Management
- New tab is created if `tabid` is not provided
- Tab name format: `{title}_{tone.name}`
- Each tab maintains its own conversation context
- Users can only access their own tabs

### Input Validation
- Title is required and must be meaningful
- Feature is required and should be descriptive
- Tone name must be one of the supported values
- MessageId is optional for first message, required for follow-ups

### Response Generation
- AI-powered content generation
- Maintains specified tone throughout response
- Responses are SEO-optimized
- Maximum response length: 300 characters
- Content is stored for future reference

## Technical Notes

### Authentication
- Bearer token required in Authorization header
- Token must be valid and not expired
- User context is extracted from token

### Rate Limiting
- Default: 100 requests per minute per user
- Burst: 150 requests per minute
- Response includes rate limit headers

### Security
- Input sanitization for XSS prevention
- SQL injection protection
- No sensitive data in logs
- HTTPS required

### Performance
- Average response time: < 2 seconds
- Timeout: 10 seconds
- Concurrent requests: Supported

## Best Practices

1. **Starting New Conversations**
   - Omit tabid and messageId
   - Provide clear title and feature
   - Choose appropriate tone

2. **Continuing Conversations**
   - Include valid tabid
   - Provide unique messageId
   - Maintain context in feature description

3. **Error Handling**
   - Implement retry logic for 5xx errors
   - Handle rate limiting gracefully
   - Validate input before sending

4. **Performance Optimization**
   - Cache frequently used responses
   - Implement request debouncing
   - Monitor rate limits