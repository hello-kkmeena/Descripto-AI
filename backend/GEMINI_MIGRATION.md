# Migration from OpenAI to Google Gemini

This document outlines the changes made to migrate from OpenAI GPT-4 to Google Gemini 2.0 Flash Lite for the Descripto-AI backend.

## Changes Made

### 1. Dependencies Updated
- **Removed**: `openai==0.28.1`
- **Added**: `google-generativeai==0.3.2`

### 2. Service Layer Changes
- **New File**: `services/gemini_service.py` - Replaces `services/openai_service.py`
- **Model**: Uses `models/gemini-2.0-flash-lite` (free tier)
- **API**: Google Generative AI instead of OpenAI

### 3. Environment Variables
- **Changed**: `OPENAI_API_KEY` → `GOOGLE_API_KEY`
- **API Key Source**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Route Updates
- **Updated**: `routes/generate.py` now imports from `gemini_service` instead of `openai_service`
- **Functionality**: Same API endpoints, same response format

### 5. Documentation Updates
- **Updated**: `README.md` reflects Gemini integration
- **New**: `setup_gemini.py` - Automated setup script
- **New**: `test_gemini.py` - Integration test script

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
python setup_gemini.py
```

### 2. Get Google API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### 3. Configure Environment
Create `.env` file:
```env
FLASK_ENV=development
GOOGLE_API_KEY=your-google-api-key-here
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=INFO
```

### 4. Test Integration
```bash
python test_gemini.py
```

### 5. Run Application
```bash
python app.py
```

## Benefits of Gemini 2.0 Flash Lite

- **Free Tier**: No cost for API calls
- **Fast**: Optimized for speed and efficiency
- **Reliable**: Google's infrastructure
- **Multimodal**: Can handle text, images, and more (future expansion)

## API Compatibility

The migration maintains full API compatibility:
- Same request format
- Same response format
- Same error handling
- Same rate limiting
- Same logging

## Troubleshooting

### Common Issues

1. **Import Error**: Make sure to install requirements
   ```bash
   pip install -r requirements.txt
   ```

2. **API Key Error**: Verify your Google API key is set correctly
   ```bash
   echo $GOOGLE_API_KEY
   ```

3. **Model Not Found**: The model name should be `models/gemini-2.0-flash-lite`

### Testing

Run the test script to verify everything works:
```bash
python test_gemini.py
```

## Rollback Plan

If needed, you can rollback to OpenAI by:
1. Reverting `requirements.txt` to include `openai==0.28.1`
2. Restoring `services/openai_service.py`
3. Updating `routes/generate.py` to import from `openai_service`
4. Setting `OPENAI_API_KEY` in `.env`

## Support

For issues with:
- **Gemini API**: Check [Google AI Studio documentation](https://ai.google.dev/docs)
- **Application**: Check the logs in `logs/` directory
- **Setup**: Run `python setup_gemini.py` for automated setup 