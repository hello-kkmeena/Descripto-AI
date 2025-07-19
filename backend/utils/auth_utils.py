import re
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from email_validator import validate_email, EmailNotValidError
from google.auth.transport import requests
from google.oauth2 import id_token
from flask import current_app
from models import db
from models.user import User

class PasswordValidator:
    """Password validation utility class"""
    
    def __init__(self, config):
        self.min_length = config.get('MIN_PASSWORD_LENGTH', 8)
        self.require_special = config.get('REQUIRE_SPECIAL_CHAR', True)
        self.require_number = config.get('REQUIRE_NUMBER', True)
        self.require_uppercase = config.get('REQUIRE_UPPERCASE', True)
    
    def validate(self, password: str) -> Dict[str, Any]:
        """
        Validate password strength
        
        Returns:
            Dict with 'valid' boolean and 'errors' list
        """
        errors = []
        
        # Check minimum length
        if len(password) < self.min_length:
            errors.append(f"Password must be at least {self.min_length} characters long")
        
        # Check for uppercase letter
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        # Check for number
        if self.require_number and not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        # Check for special character
        if self.require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }

class EmailValidator:
    """Email validation utility class"""
    
    @staticmethod
    def validate(email: str) -> Dict[str, Any]:
        """
        Validate email format and domain
        
        Returns:
            Dict with 'valid' boolean and 'error' string
        """
        try:
            # Validate email format
            valid = validate_email(email)
            email = valid.email
            
            # Check if email already exists
            existing_user = User.find_by_email(email)
            if existing_user:
                return {
                    'valid': False,
                    'error': 'Email already registered'
                }
            
            return {
                'valid': True,
                'email': email
            }
            
        except EmailNotValidError as e:
            return {
                'valid': False,
                'error': str(e)
            }

class JWTManager:
    """JWT token management utility class"""
    
    def __init__(self, app):
        self.secret_key = app.config.get('JWT_SECRET_KEY', 'default-secret-key')
        self.access_expires = app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)
        self.refresh_expires = app.config.get('JWT_REFRESH_TOKEN_EXPIRES', 604800)
    
    def create_access_token(self, user_id: int) -> str:
        """Create JWT access token"""
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(seconds=self.access_expires),
            'iat': datetime.utcnow(),
            'type': 'access'
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def create_refresh_token(self, user_id: int) -> str:
        """Create JWT refresh token"""
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(seconds=self.refresh_expires),
            'iat': datetime.utcnow(),
            'type': 'refresh'
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def get_user_from_token(self, token: str) -> Optional[User]:
        """Get user from JWT token"""
        payload = self.verify_token(token)
        if payload and payload.get('type') == 'access':
            user_id = payload.get('user_id')
            return User.query.get(user_id)
        return None

class GoogleOAuthManager:
    """Google OAuth verification utility class"""
    
    def __init__(self, app):
        self.client_id = app.config.get('GOOGLE_CLIENT_ID')
    
    def verify_google_token(self, id_token_str: str) -> Optional[Dict[str, Any]]:
        """
        Verify Google ID token
        
        Returns:
            Dict with user info if valid, None if invalid
        """
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                id_token_str, 
                requests.Request(), 
                self.client_id
            )
            
            # Check if token is expired
            if idinfo['exp'] < datetime.utcnow().timestamp():
                return None
            
            # Return user info
            return {
                'google_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo.get('name'),
                'picture': idinfo.get('picture'),
                'email_verified': idinfo.get('email_verified', False)
            }
            
        except Exception as e:
            current_app.logger.error(f"Google token verification failed: {str(e)}")
            return None
    
    def get_or_create_user(self, google_info: Dict[str, Any]) -> User:
        """
        Get existing user or create new user from Google info
        
        Returns:
            User instance
        """
        # Try to find user by Google ID
        user = User.find_by_google_id(google_info['google_id'])
        
        if user:
            # Update user info
            user.google_email = google_info['email']
            user.google_name = google_info['name']
            user.google_picture = google_info['picture']
            user.is_verified = google_info['email_verified']
            user.update_last_login()
            db.session.commit()
            return user
        
        # Try to find user by email
        user = User.find_by_email(google_info['email'])
        
        if user:
            # Link Google account to existing user
            user.google_id = google_info['google_id']
            user.google_email = google_info['email']
            user.google_name = google_info['name']
            user.google_picture = google_info['picture']
            user.is_verified = google_info['email_verified']
            user.update_last_login()
            db.session.commit()
            return user
        
        # Create new user
        user = User(
            email=google_info['email'],
            google_id=google_info['google_id'],
            google_email=google_info['email'],
            google_name=google_info['name'],
            google_picture=google_info['picture'],
            is_verified=google_info['email_verified'],
            first_name=google_info['name'].split()[0] if google_info['name'] else None,
            last_name=' '.join(google_info['name'].split()[1:]) if google_info['name'] and len(google_info['name'].split()) > 1 else None
        )
        
        db.session.add(user)
        db.session.commit()
        
        return user

# Global instances (will be initialized in app factory)
password_validator = None
jwt_manager = None
google_oauth_manager = None

def init_auth_utils(app):
    """Initialize authentication utilities with Flask app"""
    global password_validator, jwt_manager, google_oauth_manager
    
    password_validator = PasswordValidator(app.config)
    jwt_manager = JWTManager(app)
    google_oauth_manager = GoogleOAuthManager(app)
    
    return password_validator, jwt_manager, google_oauth_manager 