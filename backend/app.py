import os
from flask import Flask, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import time
from datetime import datetime

# Import our modular components
from config import get_config
from middleware.cors import init_cors
from middleware.error_handler import init_error_handlers
from utils.logger import api_logger
from utils.auth_utils import init_auth_utils
from models import init_db
from routes.generate import generate_bp
from routes.auth import auth_bp, init_auth_limiter

def create_app(config_class=None):
    """Application factory pattern"""
    
    # Get configuration
    if config_class is None:
        config_class = get_config()
    
    # Create Flask app
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize logging
    api_logger.info("Starting Descripto-AI API", 
                   environment=os.getenv('FLASK_ENV', 'development'),
                   debug=app.config.get('DEBUG', False))
    
    # Initialize database
    db = init_db(app)
    api_logger.info("Database initialized successfully")
    
    # Initialize authentication utilities
    password_validator, jwt_manager, google_oauth_manager = init_auth_utils(app)
    api_logger.info("Authentication utilities initialized successfully")
    
    # Initialize CORS
    cors_manager = init_cors(app, config_class)
    
    # Initialize error handlers
    error_handler = init_error_handlers(app)
    
    # Initialize rate limiter
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=[app.config.get('RATELIMIT_DEFAULT', "200 per day")],
        storage_uri=app.config.get('RATELIMIT_STORAGE_URL', "memory://")
    )
    
    # Initialize auth rate limiter
    init_auth_limiter(limiter)
    
    # Register blueprints
    app.register_blueprint(generate_bp)
    app.register_blueprint(auth_bp)
    
    # Add request logging middleware
    @app.before_request
    def log_request():
        request.start_time = time.time()
        api_logger.debug("Incoming Request", 
                        method=request.method,
                        endpoint=request.endpoint,
                        url=request.url,
                        origin=request.headers.get('Origin'))
    
    @app.after_request
    def log_response(response):
        # Calculate response time
        response_time = None
        if hasattr(request, 'start_time'):
            response_time = round((time.time() - request.start_time) * 1000, 2)
        
        # Log the response
        api_logger.log_api_request(
            method=request.method,
            endpoint=request.endpoint or request.path,
            status_code=response.status_code,
            response_time=response_time,
            content_length=len(response.get_data()) if response.get_data() else 0
        )
        
        # Add CORS headers
        response = cors_manager.add_cors_headers(response)
        
        return response
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'environment': os.getenv('FLASK_ENV', 'development'),
            'version': '1.0.0',
            'features': {
                'authentication': True,
                'google_oauth': bool(app.config.get('GOOGLE_CLIENT_ID')),
                'database': 'sqlite' if 'sqlite' in app.config.get('SQLALCHEMY_DATABASE_URI', '') else 'postgresql'
            }
        }
    
    api_logger.info("Descripto-AI API initialized successfully")
    
    return app

# Create the app instance
app = create_app()

if __name__ == "__main__":
    # Start the application
    api_logger.info("Starting Flask development server")
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5001)),
        debug=app.config.get('DEBUG', False)
    )