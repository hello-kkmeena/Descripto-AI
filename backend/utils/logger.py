import logging
import sys
from datetime import datetime
import traceback
from functools import wraps
import json

class APILogger:
    """Centralized logging utility for the API"""
    
    def __init__(self, name='api', level='INFO'):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.upper()))
        
        # Prevent duplicate handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup logging handlers"""
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        
        # File handler for errors
        file_handler = logging.FileHandler('logs/api_errors.log')
        file_handler.setLevel(logging.ERROR)
        
        # Create formatters
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        
        console_handler.setFormatter(console_formatter)
        file_handler.setFormatter(file_formatter)
        
        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)
    
    def info(self, message, **kwargs):
        """Log info message"""
        self.logger.info(message, extra=kwargs)
    
    def warning(self, message, **kwargs):
        """Log warning message"""
        self.logger.warning(message, extra=kwargs)
    
    def error(self, message, error=None, **kwargs):
        """Log error message with optional exception details"""
        if error:
            error_details = {
                'error_type': type(error).__name__,
                'error_message': str(error),
                'traceback': traceback.format_exc()
            }
            kwargs['error_details'] = error_details
        
        self.logger.error(message, extra=kwargs)
    
    def debug(self, message, **kwargs):
        """Log debug message"""
        self.logger.debug(message, extra=kwargs)
    
    def log_api_request(self, method, endpoint, status_code, response_time=None, **kwargs):
        """Log API request details"""
        log_data = {
            'method': method,
            'endpoint': endpoint,
            'status_code': status_code,
            'timestamp': datetime.utcnow().isoformat(),
            'response_time_ms': response_time,
            **kwargs
        }
        
        if status_code >= 400:
            self.error(f"API Request Failed: {method} {endpoint}", **log_data)
        else:
            self.info(f"API Request: {method} {endpoint}", **log_data)
    
    def log_api_error(self, method, endpoint, error, request_data=None, **kwargs):
        """Log API error with detailed information"""
        error_data = {
            'method': method,
            'endpoint': endpoint,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'traceback': traceback.format_exc(),
            'timestamp': datetime.utcnow().isoformat(),
            'request_data': request_data,
            **kwargs
        }
        
        self.error(f"API Error: {method} {endpoint}", error=error, **error_data)

def log_errors(logger_name='api'):
    """Decorator to log errors in API endpoints"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger = APILogger(logger_name)
            
            try:
                return func(*args, **kwargs)
            except Exception as e:
                # Get request details if available
                request_data = None
                method = "UNKNOWN"
                endpoint = "UNKNOWN"
                
                # Try to extract request info from Flask context
                try:
                    from flask import request
                    method = request.method
                    endpoint = request.endpoint or request.path
                    request_data = {
                        'headers': dict(request.headers),
                        'args': dict(request.args),
                        'json': request.get_json(silent=True),
                        'form': dict(request.form) if request.form else None
                    }
                except:
                    pass
                
                logger.log_api_error(method, endpoint, e, request_data)
                raise
                
        return wrapper
    return decorator

# Create default logger instance
api_logger = APILogger('api') 