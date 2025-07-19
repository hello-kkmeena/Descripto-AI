# Descripto-AI Frontend

React-based frontend for the Descripto-AI application that provides a user interface for generating E-commerce product descriptions.

## Overview

The frontend is built with React and provides a simple, intuitive interface for users to enter their product details and receive AI-generated descriptions. It communicates with the backend API to process requests and display results.

## Directory Structure

```
frontend/
├── public/               # Public assets
│   └── index.html        # HTML template
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── DescriptionForm.js     # Form for product details
│   │   └── DescriptionResults.js  # Component to display results
│   ├── App.js            # Main application component
│   ├── App.css           # Main application styles
│   └── index.js          # Application entry point
├── .env                  # Environment variables (not in repository)
├── package.json          # Project dependencies and scripts
└── README.md             # This file
```

## Components

### DescriptionForm

This component renders a form with the following inputs:
- Product title input field
- Product features textarea
- Tone selection dropdown (professional, fun, friendly)
- Generate button
- Error display

The form collects user input and sends it to the backend API when the user clicks the "Generate Descriptions" button.

### DescriptionResults

This component displays the list of generated descriptions returned from the API. It renders:
- A header for the results section
- A list of generated descriptions

## Environment Configuration

The frontend requires an environment file (`.env`) with the following variables:

```
REACT_APP_API_URL=http://localhost:5000
```

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create an environment file:
   ```
   cp .env.example .env
   ```
   Edit `.env` to configure the backend API URL.

### Running

Start the development server:

```
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

```
npm run build
```

This will create an optimized build in the `build` directory.

## Testing

```
npm test
```

## Customization

### Styling

The main styling is in `App.css`. You can modify this file to change the application's appearance.

### Adding New Features

To add new form fields or options:
1. Update the state in `DescriptionForm.js`
2. Add the new UI elements
3. Include the new data in the API request payload
