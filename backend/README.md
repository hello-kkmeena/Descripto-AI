# Descripto-AI Backend

A Flask-based API for generating AI-powered product descriptions with comprehensive logging, CORS support, and modular architecture.

## Features

- **AI-Powered Description Generation**: Uses Google Gemini 2.0 Flash Lite for generating product descriptions
- **Modular Architecture**: Clean separation of concerns with configurable components
- **Comprehensive Logging**: Detailed request/response logging with error tracking
- **CORS Support**: Environment-specific CORS configuration for development and production
- **Error Handling**: Centralized error handling with detailed logging
- **Rate Limiting**: Configurable rate limiting to prevent API abuse
- **Environment Configuration**: Separate configurations for development, production, and testing

## Project Structure

```
backend/
├── config/
│   └── __init__.py          # Environment-specific configurations
├── middleware/
│   ├── cors.py              # CORS configuration and handling
│   └── error_handler.py     # Centralized error handling
├── routes/
│   └── generate.py          # API endpoints
├── services/
│   └── gemini_service.py    # Google Gemini API integration
├── utils/
│   └── logger.py            # Logging utilities
├── logs/                    # Log files directory
├── app.py                   # Main Flask application
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   FLASK_ENV=development
   GOOGLE_API_KEY=your-google-api-key-here
   SECRET_KEY=your-secret-key-here
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   LOG_LEVEL=INFO
   ```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `FLASK_ENV` | Environment (development/production/testing) | development | No |
| `GOOGLE_API_KEY` | Google API key for Gemini AI generation | - | Yes |
| `SECRET_KEY` | Flask secret key | dev-secret-key | No |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | localhost:3000 | No |
| `LOG_LEVEL` | Logging level (DEBUG/INFO/WARNING/ERROR) | INFO | No |
| `PORT` | Server port | 5000 | No |

### Environment-Specific Configurations

#### Development
- Debug mode enabled
- Permissive CORS (localhost:3000, 127.0.0.1:3000)
- Detailed logging
- Higher rate limits (1000/day)

#### Production
- Debug mode disabled
- Restrictive CORS (environment-specific)
- Warning-level logging
- Lower rate limits (100/day)

#### Testing
- Debug mode enabled
- In-memory database
- Detailed logging
- Test-specific CORS

## Usage

### Starting the Server

```bash
# Development
python app.py

# Or with environment variable
FLASK_ENV=development python app.py
```

### API Endpoints

#### Health Check
```http
GET /health
```
Returns server status and configuration information.

#### Generate Descriptions
```http
POST /generate-description
Content-Type: application/json

{
  "title": "Product Title",
  "features": "Product features and benefits",
  "tone": "professional"
}
```

**Response:**
```json
{
  "descriptions": [
    "Professional description 1",
    "Professional description 2",
    "Professional description 3"
  ],
  "generation_time_ms": 1250.5,
  "count": 3
}
```

**Tone Options:**
- `professional`: Formal, business-like tone
- `fun`: Casual, engaging tone
- `friendly`: Warm, approachable tone

## Logging

### Log Files
- **Console**: All log levels
- **logs/api_errors.log**: Error-level logs with detailed information

### Log Format
```
2024-01-15 10:30:45 - api - INFO - API Request: POST /generate-description
2024-01-15 10:30:46 - api - ERROR - API Error: POST /generate-description
```

### Logged Information
- Request/response details
- Performance metrics (response time)
- Error details with stack traces
- CORS preflight requests
- Gemini API interactions

## CORS Configuration

### Development
```python
CORS_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
]
```

### Production
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Error Handling

The application includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: CORS origin not allowed
- **404 Not Found**: Endpoint not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server errors

All errors are logged with detailed information including:
- Request details
- Error type and message
- Stack trace
- Timestamp

## Rate Limiting

- **Development**: 1000 requests per day
- **Production**: 100 requests per day
- **Custom**: Configurable via environment variables

## Development

### Adding New Endpoints

1. Create a new route file in `routes/`
2. Import and register the blueprint in `app.py`
3. Use the `@log_errors` decorator for automatic error logging

### Adding New Services

1. Create a new service file in `services/`
2. Import the logger: `from utils.logger import api_logger`
3. Add appropriate logging for debugging and monitoring

### Testing

```bash
# Run tests (when implemented)
python -m pytest

# Run with specific environment
FLASK_ENV=testing python -m pytest
```

## Production Deployment

### Environment Setup
```env
FLASK_ENV=production
OPENAI_API_KEY=your-production-api-key
SECRET_KEY=your-production-secret-key
CORS_ORIGINS=https://yourdomain.com
LOG_LEVEL=WARNING
DATABASE_URL=postgresql://user:password@host:port/db
```

### Security Considerations
- Use strong secret keys
- Restrict CORS origins to production domains
- Set appropriate rate limits
- Monitor logs for suspicious activity
- Use HTTPS in production

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGINS` configuration
   - Verify frontend URL is in allowed origins
   - Check browser console for specific error

2. **OpenAI API Errors**
   - Verify `OPENAI_API_KEY` is set correctly
   - Check API key permissions and quotas
   - Review logs for specific error messages

3. **Rate Limiting**
   - Check current usage in logs
   - Adjust rate limits if needed
   - Consider upgrading API plan

### Log Analysis

```bash
# View recent errors
tail -f logs/api_errors.log

# Search for specific errors
grep "ERROR" logs/api_errors.log

# Monitor API requests
grep "API Request" logs/api_errors.log
```

## Contributing

1. Follow the modular architecture pattern
2. Add appropriate logging to new features
3. Update configuration for new environments
4. Test CORS configuration for new endpoints
5. Update this README for new features

## License

This project is licensed under the MIT License.
