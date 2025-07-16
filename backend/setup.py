#!/usr/bin/env python3
"""
Setup script for Descripto-AI Backend
Creates necessary directories and helps with initial configuration
"""

import os
import sys
from pathlib import Path

def create_directories():
    """Create necessary directories"""
    directories = [
        'logs',
        'config',
        'middleware',
        'routes',
        'services',
        'utils'
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✓ Created directory: {directory}")

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_file = Path('.env')
    
    if env_file.exists():
        print("✓ .env file already exists")
        return
    
    env_content = """# Flask Configuration
FLASK_ENV=development
PORT=5000
SECRET_KEY=dev-secret-key-change-in-production

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Logging Configuration
LOG_LEVEL=INFO

# Rate Limiting
RATELIMIT_DEFAULT=1000 per day
"""
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print("✓ Created .env file")
    print("⚠️  Please update the .env file with your OpenAI API key")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import openai
        import flask_cors
        import python_dotenv
        import flask_limiter
        print("✓ All required dependencies are installed")
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up Descripto-AI Backend...")
    print()
    
    # Create directories
    print("Creating directories...")
    create_directories()
    print()
    
    # Create .env file
    print("Setting up environment configuration...")
    create_env_file()
    print()
    
    # Check dependencies
    print("Checking dependencies...")
    if not check_dependencies():
        sys.exit(1)
    print()
    
    print("✅ Setup complete!")
    print()
    print("Next steps:")
    print("1. Update .env file with your OpenAI API key")
    print("2. Run: python app.py")
    print("3. Test the API at: http://localhost:5000/health")
    print()
    print("For more information, see README.md")

if __name__ == "__main__":
    main() 