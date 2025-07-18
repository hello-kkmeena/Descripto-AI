# Descripto-AI

A web application that generates persuasive E-commerce product descriptions using OpenAI's GPT-4 model.

## Overview

Descripto-AI is designed to help E-commerce sellers create compelling product descriptions quickly and efficiently. By leveraging AI technology, it generates SEO-friendly descriptions under 300 characters based on the product title, key features, and selected tone.

## Features

- AI-powered description generation
- Customizable tone (professional, fun, friendly)
- Multiple description options (generates 3 variants)
- User-friendly interface
- SEO-optimized output

## Project Structure

The project follows a client-server architecture:

- **Frontend**: React application with a simple form interface
- **Backend**: Flask API that interfaces with OpenAI

```
product-description/
├── frontend/           # React frontend application
├── backend/            # Flask backend API
├── .gitignore          # Git ignore file
└── README.md           # This file
```

For detailed information about each component, see their respective README files:

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## Quick Start

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- OpenAI API key

### Installation & Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/product-description.git
   cd product-description
   ```

2. Set up the backend
   ```
   cd backend
   pip install -r requirements.txt
   cp .env.example .env  # Then edit .env to add your OpenAI API key
   ```

3. Set up the frontend
   ```
   cd frontend
   npm install
   cp .env.example .env  # Then edit .env to add your backend API URL
   ```

### Running the Application

1. Start the backend server
   ```
   cd backend
   python app.py
   ```

2. Start the frontend development server
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## License

[MIT License](LICENSE)

## Contributors

- Your Name

## Acknowledgements

- OpenAI for providing the GPT-4 API
- React and Flask communities for excellent documentation
