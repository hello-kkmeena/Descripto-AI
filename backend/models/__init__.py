from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy instance
db = SQLAlchemy()

def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    
    # Import models to ensure they are registered
    from .user import User
    
    # Create all tables
    with app.app_context():
        db.create_all()
    
    return db 