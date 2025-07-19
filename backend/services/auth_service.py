from typing import Dict, Any, Optional, Tuple
from flask import current_app
from models import db
from models.user import User
from utils.auth_utils import EmailValidator
from utils.logger import api_logger

class AuthService:
    """Authentication service for handling user registration, login, and OAuth"""
    
    @staticmethod
    def _get_auth_utils():
        """Get authentication utilities from current app context"""
        from utils.auth_utils import password_validator, jwt_manager, google_oauth_manager
        return password_validator, jwt_manager, google_oauth_manager
    
    @staticmethod
    def register_user(email: str, password: str, first_name: str = None, last_name: str = None) -> Tuple[bool, Dict[str, Any]]:
        """
        Register a new user with email and password
        
        Args:
            email: User's email address
            password: User's password
            first_name: User's first name (optional)
            last_name: User's last name (optional)
            
        Returns:
            Tuple of (success: bool, response: dict)
        """
        try:
            # Get authentication utilities
            password_validator, jwt_manager, google_oauth_manager = AuthService._get_auth_utils()
            
            # Validate email
            email_validation = EmailValidator.validate(email)
            if not email_validation['valid']:
                return False, {
                    'error': 'Invalid email',
                    'details': email_validation['error']
                }

            print("Email validation............. + ", email_validation)
            print("Password validator............. + ", password_validator)
            
            # Validate password
            password_validation = password_validator.validate(password)
            if not password_validation['valid']:
                return False, {
                    'error': 'Invalid password',
                    'details': password_validation['errors']
                }
            print("Password validation............. + ", password_validation)
            
            # Create user
            user = User.create_user(
                email=email_validation['email'],
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            print("User created............. + ", user)
            
            # Generate tokens
            access_token = jwt_manager.create_access_token(user.id)
            refresh_token = jwt_manager.create_refresh_token(user.id)
            print("Access token............. + ", access_token)
            print("Refresh token............. + ", refresh_token)
            
            # Log successful registration
            api_logger.info("User registered successfully", 
                          user_id=user.id, 
                          email=user.email)
        
            
            return True, {
                'message': 'User registered successfully',
                'user': user.to_dict(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }

            
        except Exception as e:
            api_logger.error("User registration failed", 
                           error=str(e), 
                           email=email)
            return False, {
                'error': 'Registration failed',
                'details': str(e)
            }
    
    @staticmethod
    def login_user(email: str, password: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Authenticate user with email and password
        
        Args:
            email: User's email address
            password: User's password
            
        Returns:
            Tuple of (success: bool, response: dict)
        """
        try:
            # Get authentication utilities
            password_validator, jwt_manager, google_oauth_manager = AuthService._get_auth_utils()
            
            # Find user by email
            user = User.find_by_email(email)
            if not user:
                return False, {
                    'error': 'Invalid credentials',
                    'details': 'Email or password is incorrect'
                }
            
            # Check if user is active
            if not user.is_active:
                return False, {
                    'error': 'Account disabled',
                    'details': 'Your account has been disabled'
                }
            
            # Verify password
            if not user.check_password(password):
                return False, {
                    'error': 'Invalid credentials',
                    'details': 'Email or password is incorrect'
                }
            
            # Update last login
            user.update_last_login()
            
            # Generate tokens
            access_token = jwt_manager.create_access_token(user.id)
            refresh_token = jwt_manager.create_refresh_token(user.id)
            
            # Log successful login
            api_logger.info("User logged in successfully", 
                          user_id=user.id, 
                          email=user.email)
            
            return True, {
                'message': 'Login successful',
                'user': user.to_dict(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
            
        except Exception as e:
            api_logger.error("User login failed", 
                           error=str(e), 
                           email=email)
            return False, {
                'error': 'Login failed',
                'details': str(e)
            }
    
    @staticmethod
    def google_oauth_login(id_token: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Authenticate user with Google OAuth
        
        Args:
            id_token: Google ID token from frontend
            
        Returns:
            Tuple of (success: bool, response: dict)
        """
        try:
            # Get authentication utilities
            password_validator, jwt_manager, google_oauth_manager = AuthService._get_auth_utils()
            
            # Verify Google token
            google_info = google_oauth_manager.verify_google_token(id_token)
            if not google_info:
                return False, {
                    'error': 'Invalid Google token',
                    'details': 'Could not verify Google authentication'
                }
            
            # Get or create user
            user = google_oauth_manager.get_or_create_user(google_info)
            
            # Check if user is active
            if not user.is_active:
                return False, {
                    'error': 'Account disabled',
                    'details': 'Your account has been disabled'
                }
            
            # Generate tokens
            access_token = jwt_manager.create_access_token(user.id)
            refresh_token = jwt_manager.create_refresh_token(user.id)
            
            # Log successful OAuth login
            api_logger.info("User logged in with Google OAuth", 
                          user_id=user.id, 
                          email=user.email,
                          google_id=user.google_id)
            
            return True, {
                'message': 'Google OAuth login successful',
                'user': user.to_dict(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
            
        except Exception as e:
            api_logger.error("Google OAuth login failed", 
                           error=str(e))
            return False, {
                'error': 'Google OAuth login failed',
                'details': str(e)
            }
    
    @staticmethod
    def refresh_token(refresh_token: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Refresh access token using refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            Tuple of (success: bool, response: dict)
        """
        try:
            # Get authentication utilities
            password_validator, jwt_manager, google_oauth_manager = AuthService._get_auth_utils()
            
            # Verify refresh token
            payload = jwt_manager.verify_token(refresh_token)
            if not payload or payload.get('type') != 'refresh':
                return False, {
                    'error': 'Invalid refresh token',
                    'details': 'Refresh token is invalid or expired'
                }
            
            # Get user
            user_id = payload.get('user_id')
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return False, {
                    'error': 'User not found',
                    'details': 'User does not exist or is inactive'
                }
            
            # Generate new access token
            new_access_token = jwt_manager.create_access_token(user.id)
            
            return True, {
                'message': 'Token refreshed successfully',
                'access_token': new_access_token,
                'user': user.to_dict()
            }
            
        except Exception as e:
            api_logger.error("Token refresh failed", 
                           error=str(e))
            return False, {
                'error': 'Token refresh failed',
                'details': str(e)
            }
    
    @staticmethod
    def get_current_user(token: str) -> Optional[User]:
        """
        Get current user from JWT token
        
        Args:
            token: JWT access token
            
        Returns:
            User instance or None
        """
        try:
            # Get authentication utilities
            password_validator, jwt_manager, google_oauth_manager = AuthService._get_auth_utils()
            return jwt_manager.get_user_from_token(token)
        except Exception as e:
            api_logger.error("Failed to get current user", 
                           error=str(e))
            return None
    
    @staticmethod
    def update_user_profile(user_id: int, **kwargs) -> Tuple[bool, Dict[str, Any]]:
        """
        Update user profile information
        
        Args:
            user_id: User ID
            **kwargs: Profile fields to update
            
        Returns:
            Tuple of (success: bool, response: dict)
        """
        try:
            user = User.query.get(user_id)
            if not user:
                return False, {
                    'error': 'User not found',
                    'details': 'User does not exist'
                }
            
            # Update allowed fields
            allowed_fields = ['first_name', 'last_name']
            for field, value in kwargs.items():
                if field in allowed_fields and value is not None:
                    setattr(user, field, value)
            
            db.session.commit()
            
            api_logger.info("User profile updated", 
                          user_id=user.id)
            
            return True, {
                'message': 'Profile updated successfully',
                'user': user.to_dict()
            }
            
        except Exception as e:
            api_logger.error("Profile update failed", 
                           error=str(e), 
                           user_id=user_id)
            return False, {
                'error': 'Profile update failed',
                'details': str(e)
            }
    
    @staticmethod
    def change_password(user_id: int, current_password: str, new_password: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Change user password
        
        Args:
            user_id: User ID
            current_password: Current password
            new_password: New password
            
        Returns:
            Tuple of (success: bool, response: dict)
        """
        try:
            user = User.query.get(user_id)
            if not user:
                return False, {
                    'error': 'User not found',
                    'details': 'User does not exist'
                }
            
            # Check if user has password (not Google OAuth only)
            if not user.password_hash:
                return False, {
                    'error': 'No password set',
                    'details': 'This account uses Google OAuth only'
                }
            
            # Verify current password
            if not user.check_password(current_password):
                return False, {
                    'error': 'Invalid current password',
                    'details': 'Current password is incorrect'
                }
            
            # Validate new password
            password_validator, _, _ = AuthService._get_auth_utils() # Get password_validator only
            password_validation = password_validator.validate(new_password)
            if not password_validation['valid']:
                return False, {
                    'error': 'Invalid new password',
                    'details': password_validation['errors']
                }
            
            # Update password
            user.password_hash = user._hash_password(new_password)
            db.session.commit()
            
            api_logger.info("User password changed", 
                          user_id=user.id)
            
            return True, {
                'message': 'Password changed successfully'
            }
            
        except Exception as e:
            api_logger.error("Password change failed", 
                           error=str(e), 
                           user_id=user_id)
            return False, {
                'error': 'Password change failed',
                'details': str(e)
            } 