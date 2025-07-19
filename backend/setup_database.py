#!/usr/bin/env python3
"""
Database setup script for Render deployment
Ensures SQLite database directory exists and is writable
"""

import os
import sqlite3
from pathlib import Path

def setup_database():
    """Setup SQLite database for production deployment"""
    
    # Get the database path
    database_url = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    
    if database_url.startswith('sqlite:///'):
        # Extract the database file path
        db_path = database_url.replace('sqlite:///', '')
        
        # If it's a relative path, make it absolute
        if not os.path.isabs(db_path):
            # Use the current working directory
            db_path = os.path.join(os.getcwd(), db_path)
        
        # Create the directory if it doesn't exist
        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
            print(f"Created database directory: {db_dir}")
        
        # Test database connection
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Create a test table to verify write permissions
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS test_table (
                    id INTEGER PRIMARY KEY,
                    test_column TEXT
                )
            ''')
            
            # Insert a test record
            cursor.execute('INSERT INTO test_table (test_column) VALUES (?)', ('test',))
            conn.commit()
            
            # Clean up test data
            cursor.execute('DELETE FROM test_table')
            conn.commit()
            
            conn.close()
            print(f"Database setup successful: {db_path}")
            return True
            
        except Exception as e:
            print(f"Database setup failed: {e}")
            return False
    
    else:
        print(f"Using external database: {database_url}")
        return True

if __name__ == "__main__":
    setup_database() 