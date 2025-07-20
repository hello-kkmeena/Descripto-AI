from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from marshmallow import  ValidationError
from services.auth_service import AuthService
from utils.logger import api_logger
from functools import wraps
from schema.authSchema import RegisterSchema, LoginSchema, GoogleOAuthSchema, RefreshTokenSchema, UpdateProfileSchema, ChangePasswordSchema

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Rate limiter instance (will be initialized in app factory)
limiter = None

def init_auth_limiter(app_limiter):
    """Initialize rate limiter for auth routes"""
    global limiter
    limiter = app_limiter

# Fallback decorator for when limiter is not initialized
def rate_limit_fallback(limit_string):
    """Fallback decorator when rate limiter is not available"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# Authentication decorator
def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                'error': 'Authentication required',
                'details': 'Authorization header is missing'
            }), 401
        
        # Extract token from "Bearer <token>"
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({
                'error': 'Invalid authorization header',
                'details': 'Format should be: Bearer <token>'
            }), 401
        
        # Get current user
        user = AuthService.get_current_user(token)
        if not user:
            return jsonify({
                'error': 'Invalid token',
                'details': 'Token is invalid or expired'
            }), 401
        
        # Add user to request context
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

# Authentication routes
@auth_bp.route('/register', methods=['POST'])
@(limiter.limit("5 per minute") if limiter else rate_limit_fallback("5 per minute"))
def register():
    """
    Register a new user
    
    Request body:
    {
        "email": "user@example.com",
        "password": "SecurePassword123!",
        "first_name": "John",
        "last_name": "Doe"
    }
    
    Returns:
    {
        "message": "User registered successfully",
        "user": {...},
        "access_token": "...",
        "refresh_token": "..."
    }
    """
    try:
        # Validate request data
        schema = RegisterSchema()
        data = schema.load(request.get_json())
    
        # Register user
        success, response = AuthService.register_user(
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name')
        )
        
        if success:
            return jsonify(response), 201
        else:
            return jsonify(response), 400
            
    except ValidationError as e:
        return jsonify({
            'error': 'Validation error',
            'details': e.messages
        }), 400
    except Exception as e:
        api_logger.error("Registration endpoint error", error=str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/login', methods=['POST'])
@(limiter.limit("10 per minute") if limiter else rate_limit_fallback("10 per minute"))
def login():
    """
    Login with email and password
    
    Request body:
    {
        "email": "user@example.com",
        "password": "SecurePassword123!"
    }
    
    Returns:
    {
        "message": "Login successful",
        "user": {...},
        "access_token": "...",
        "refresh_token": "..."
    }
    """
    try:
        # Validate request data
        schema = LoginSchema()
        data = schema.load(request.get_json())
        
        # Login user
        success, response = AuthService.login_user(
            email=data['email'],
            password=data['password']
        )
        
        if success:
            return jsonify(response), 200
        else:
            return jsonify(response), 401
            
    except ValidationError as e:
        return jsonify({
            'error': 'Validation error',
            'details': e.messages
        }), 400
    except Exception as e:
        api_logger.error("Login endpoint error", error=str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/google', methods=['POST'])
@(limiter.limit("10 per minute") if limiter else rate_limit_fallback("10 per minute"))
def google_oauth():
    """
    Login with Google OAuth
    
    Request body:
    {
        "id_token": "google_id_token_from_frontend"
    }
    
    Returns:
    {
        "message": "Google OAuth login successful",
        "user": {...},
        "access_token": "...",
        "refresh_token": "..."
    }
    """
    try:
        # Validate request data
        schema = GoogleOAuthSchema()
        data = schema.load(request.get_json())
        
        # Google OAuth login
        success, response = AuthService.google_oauth_login(data['id_token'])
        
        if success:
            return jsonify(response), 200
        else:
            return jsonify(response), 401
            
    except ValidationError as e:
        return jsonify({
            'error': 'Validation error',
            'details': e.messages
        }), 400
    except Exception as e:
        api_logger.error("Google OAuth endpoint error", error=str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
@(limiter.limit("20 per minute") if limiter else rate_limit_fallback("20 per minute"))
def refresh_token():
    """
    Refresh access token
    
    Request body:
    {
        "refresh_token": "refresh_token_here"
    }
    
    Returns:
    {
        "message": "Token refreshed successfully",
        "access_token": "...",
        "user": {...}
    }
    """
    try:
        # Validate request data
        schema = RefreshTokenSchema()
        data = schema.load(request.get_json())
        
        # Refresh token
        success, response = AuthService.refresh_token(data['refresh_token'])
        
        if success:
            return jsonify(response), 200
        else:
            return jsonify(response), 401
            
    except ValidationError as e:
        return jsonify({
            'error': 'Validation error',
            'details': e.messages
        }), 400
    except Exception as e:
        api_logger.error("Token refresh endpoint error", error=str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """
    Get current user profile
    
    Headers:
    Authorization: Bearer <access_token>
    
    Returns:
    {
        "user": {...}
    }
    """
    try:
        user = request.current_user
        return jsonify({
            'user': user.to_dict()
        }), 200
    except Exception as e:
        api_logger.error("Get current user endpoint error", error=str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    """
    Verify if a token is valid (for client-side auth status check)
    
    Headers:
    Authorization: Bearer <access_token>
    
    Returns:
    {
        "user": {...}
    }
    """
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                'error': 'No authorization header'
            }), 401
        
        # Extract token from "Bearer <token>"
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({
                'error': 'Invalid authorization header'
            }), 401
        
        # Get current user
        user = AuthService.get_current_user(token)
        if not user:
            return jsonify({
                'error': 'Invalid token'
            }), 401
        
        return jsonify({
            'user': user.to_dict()
        }), 200
    except Exception as e:
        api_logger.error("Token verification endpoint error", error=str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/profile', methods=['PUT'])
@require_auth
@(limiter.limit("10 per minute") if limiter else rate_limit_fallback("10 per minute"))
def update_profile():
    """
    Update user profile
    
    Headers:
    Authorization: Bearer <access_token>
    
    Request body:
    {
        "first_name": "John",
        "last_name": "Doe"
    }
    
    Returns:
    {
        "message": "Profile updated successfully",
        "user": {...}
    }
    """
    try:
        # Validate request data
        schema = UpdateProfileSchema()
        data = schema.load(request.get_json())
        
        # Update profile
        success, response = AuthService.update_user_profile(
            user_id=request.current_user.id,
            **data
        )
        
        if success:
            return jsonify(response), 200
        else:
            return jsonify(response), 400
            
    except ValidationError as e:
        return jsonify({
            'error': 'Validation error',
            'details': e.messages
        }), 400
    except Exception as e:
        api_logger.error("Update profile endpoint error", error=str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/change-password', methods=['POST'])
@require_auth
@(limiter.limit("5 per minute") if limiter else rate_limit_fallback("5 per minute"))
def change_password():
    """
    Change user password
    
    Headers:
    Authorization: Bearer <access_token>
    
    Request body:
    {
        "current_password": "OldPassword123!",
        "new_password": "NewPassword456!"
    }
    
    Returns:
    {
        "message": "Password changed successfully"
    }
    """
    try:
        # Validate request data
        schema = ChangePasswordSchema()
        data = schema.load(request.get_json())
        
        # Change password
        success, response = AuthService.change_password(
            user_id=request.current_user.id,
            current_password=data['current_password'],
            new_password=data['new_password']
        )
        
        if success:
            return jsonify(response), 200
        else:
            return jsonify(response), 400
            
    except ValidationError as e:
        return jsonify({
            'error': 'Validation error',
            'details': e.messages
        }), 400
    except Exception as e:
        api_logger.error("Change password endpoint error", error=str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    """
    Logout user (client-side token invalidation)
    
    Headers:
    Authorization: Bearer <access_token>
    
    Returns:
    {
        "message": "Logged out successfully"
    }
    """
    try:
        # Note: JWT tokens are stateless, so we can't invalidate them server-side
        # In a production environment, you might want to implement a token blacklist
        # For now, we just return success and let the client discard the tokens
        
        api_logger.info("User logged out", user_id=request.current_user.id)
        
        return jsonify({
            'message': 'Logged out successfully'
        }), 200
    except Exception as e:
        api_logger.error("Logout endpoint error", error=str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': 'An unexpected error occurred'
        }), 500 