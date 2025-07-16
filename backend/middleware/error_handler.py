from flask import jsonify, request
from utils.logger import api_logger
import traceback
from datetime import datetime

class ErrorHandler:
    """Centralized error handling for the API"""
    
    def __init__(self, app):
        self.app = app
        self.setup_error_handlers()
    
    def setup_error_handlers(self):
        """Setup error handlers for different HTTP status codes"""
        
        @self.app.errorhandler(400)
        def bad_request(error):
            return self.handle_error(400, "Bad Request", error)
        
        @self.app.errorhandler(401)
        def unauthorized(error):
            return self.handle_error(401, "Unauthorized", error)
        
        @self.app.errorhandler(403)
        def forbidden(error):
            return self.handle_error(403, "Forbidden", error)
        
        @self.app.errorhandler(404)
        def not_found(error):
            return self.handle_error(404, "Not Found", error)
        
        @self.app.errorhandler(405)
        def method_not_allowed(error):
            return self.handle_error(405, "Method Not Allowed", error)
        
        @self.app.errorhandler(429)
        def too_many_requests(error):
            return self.handle_error(429, "Too Many Requests", error)
        
        @self.app.errorhandler(500)
        def internal_server_error(error):
            return self.handle_error(500, "Internal Server Error", error)
        
        @self.app.errorhandler(Exception)
        def handle_exception(error):
            return self.handle_error(500, "Internal Server Error", error)
    
    def handle_error(self, status_code, message, error=None):
        """Handle errors with logging and appropriate response"""
        
        # Get request details
        request_data = {
            'method': request.method,
            'endpoint': request.endpoint or request.path,
            'url': request.url,
            'headers': dict(request.headers),
            'args': dict(request.args),
            'json': request.get_json(silent=True),
            'form': dict(request.form) if request.form else None
        }
        
        # Log the error
        api_logger.log_api_error(
            method=request.method,
            endpoint=request.endpoint or request.path,
            error=error,
            request_data=request_data,
            status_code=status_code
        )
        
        # Prepare error response
        error_response = {
            'error': message,
            'status_code': status_code,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add debug information in development
        if self.app.config.get('DEBUG', False) and error:
            error_response['debug'] = {
                'error_type': type(error).__name__,
                'error_message': str(error),
                'traceback': traceback.format_exc()
            }
        
        return jsonify(error_response), status_code

def init_error_handlers(app):
    """Initialize error handlers for the application"""
    return ErrorHandler(app) 