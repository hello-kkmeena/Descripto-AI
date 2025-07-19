#!/usr/bin/env python3
"""
Database initialization script for Descripto-AI

This script creates all database tables and optionally adds a test user.
Run this script to set up the database for the first time.
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app import create_app
from models import db
from models.user import User
from utils.auth_utils import init_auth_utils
from utils.logger import api_logger

def create_tables():
    """Create all database tables"""
    try:
        # Create Flask app
        app = create_app()
        
        with app.app_context():
            # Create all tables
            db.create_all()
            api_logger.info("Database tables created successfully")
            
            # Check if tables were created
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            api_logger.info(f"Created tables: {tables}")
            
            return True
            
    except Exception as e:
        api_logger.error(f"Failed to create tables: {str(e)}")
        return False

def create_test_user():
    """Create a test user for development"""
    try:
        app = create_app()
        
        with app.app_context():
            # Check if test user already exists
            test_user = User.find_by_email('test@example.com')
            if test_user:
                api_logger.info("Test user already exists")
                return True
            
            # Create test user
            user = User.create_user(
                email='test@example.com',
                password='TestPassword123!',
                first_name='Test',
                last_name='User'
            )
            
            api_logger.info(f"Test user created: {user.email}")
            return True
            
    except Exception as e:
        api_logger.error(f"Failed to create test user: {str(e)}")
        return False

def main():
    """Main function"""
    print("🚀 Initializing Descripto-AI Database...")
    
    # Create tables
    if create_tables():
        print("✅ Database tables created successfully")
    else:
        print("❌ Failed to create database tables")
        sys.exit(1)
    
    # Ask if user wants to create test user
    create_test = input("\n🤔 Create test user? (y/n): ").lower().strip()
    if create_test in ['y', 'yes']:
        if create_test_user():
            print("✅ Test user created successfully")
            print("📧 Email: test@example.com")
            print("🔑 Password: TestPassword123!")
        else:
            print("❌ Failed to create test user")
    
    print("\n🎉 Database initialization complete!")
    print("📝 Next steps:")
    print("   1. Copy env.example to .env and configure your settings")
    print("   2. Set up Google OAuth credentials (optional)")
    print("   3. Run the Flask application: python app.py")

if __name__ == "__main__":
    main() 