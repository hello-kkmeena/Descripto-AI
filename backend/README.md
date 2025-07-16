# Descripto-AI Backend

Flask-based backend API for the Descripto-AI application that handles requests for generating product descriptions using OpenAI's GPT-4 model.

## Overview

The backend provides a REST API that accepts product information, communicates with OpenAI's API to generate descriptions, and returns the results to the frontend. It's built with Flask and follows a modular structure.

## Directory Structure

```
backend/
├── app.py               # Main application entry point
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not in repository)
├── routes/              # API route definitions
│   └── generate.py      # API endpoint for generating descriptions
├── services/            # Business logic services
│   └── openai_service.py  # Service for communicating with OpenAI
└── README.md            # This file
```

## API Endpoints

### POST /generate-description

Generates product descriptions based on the provided information.

**Request Body:**
```json
{
  "title": "String (required) - Product title",
  "features": "String (required) - Key product features",
  "tone": "String (optional) - Tone of the descriptions (default: 'professional')"
}
```

**Response:**
```json
{
  "descriptions": ["String", "String", "String"]
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## OpenAI Service

The `openai_service.py` module contains the logic for interacting with the OpenAI API:

- It configures the OpenAI API key from environment variables
- It constructs the prompt for generating descriptions
- It processes the response from OpenAI to extract the generated descriptions

## Environment Configuration

The backend requires an environment file (`.env`) with the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Development

### Prerequisites

- Python 3.8+
- pip

### Setup

1. Create a virtual environment (recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create an environment file:
   ```
   cp .env.example .env
   ```
   Edit `.env` to add your OpenAI API key.

### Running

Start the development server:

```
python app.py
```

The API will be available at `http://localhost:5000`.

### Production Deployment

For production, consider using a proper WSGI server like Gunicorn:

```
pip install gunicorn
gunicorn app:app
```

## Testing

You can test the API using tools like curl or Postman:

```bash
curl -X POST \
  http://localhost:5000/generate-description \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Wireless Bluetooth Headphones",
    "features": "Noise cancellation, 30-hour battery life, comfortable ear cups",
    "tone": "professional"
  }'
```

## Extending the API

To add new endpoints:

1. Create a new file in the `routes` directory
2. Define your route handlers
3. Register the new blueprint in `app.py`

## Error Handling

The API includes error handling for:
- Missing JSON payload
- Missing required fields
- OpenAI API errors
- General exceptions
