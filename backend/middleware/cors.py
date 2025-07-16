from flask_cors import CORS
from flask import request, jsonify
from utils.logger import api_logger

class CORSManager:
    """CORS configuration manager for different environments"""
    
    def __init__(self, app, config):
        self.app = app
        self.config = config
        self.setup_cors()
    
    def setup_cors(self):
        """Setup CORS based on configuration"""
        cors_config = {
            'origins': self.config.CORS_ORIGINS,
            'methods': self.config.CORS_METHODS,
            'allow_headers': self.config.CORS_ALLOW_HEADERS,
            'supports_credentials': True,
            'max_age': 3600  # Cache preflight requests for 1 hour
        }
        
        # Log CORS configuration
        api_logger.info("Setting up CORS", cors_config=cors_config)
        
        # Initialize CORS
        CORS(self.app, **cors_config)
        
        # Add CORS preflight handler
        self.app.before_request(self.handle_cors_preflight)
    
    def handle_cors_preflight(self):
        """Handle CORS preflight requests"""
        if request.method == 'OPTIONS':
            # Log preflight request
            api_logger.debug("CORS Preflight Request", 
                           origin=request.headers.get('Origin'),
                           method=request.headers.get('Access-Control-Request-Method'))
            
            # Check if origin is allowed
            origin = request.headers.get('Origin')
            if origin and origin in self.config.CORS_ORIGINS:
                response = jsonify({'status': 'ok'})
                response.headers['Access-Control-Allow-Origin'] = origin
                response.headers['Access-Control-Allow-Methods'] = ', '.join(self.config.CORS_METHODS)
                response.headers['Access-Control-Allow-Headers'] = ', '.join(self.config.CORS_ALLOW_HEADERS)
                response.headers['Access-Control-Max-Age'] = '3600'
                return response
            else:
                # Log blocked origin
                api_logger.warning("CORS Origin Blocked", 
                                 origin=origin, 
                                 allowed_origins=self.config.CORS_ORIGINS)
                return jsonify({'error': 'CORS origin not allowed'}), 403
    
    def add_cors_headers(self, response):
        """Add CORS headers to response"""
        origin = request.headers.get('Origin')
        if origin and origin in self.config.CORS_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

def init_cors(app, config):
    """Initialize CORS for the application"""
    return CORSManager(app, config) 