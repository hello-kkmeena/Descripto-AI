from marshmallow import Schema, fields

class RegisterSchema(Schema):
    """Schema for user registration"""
    email = fields.Email(required=True, error_messages={'required': 'Email is required'})
    password = fields.Str(required=True, error_messages={'required': 'Password is required'})
    first_name = fields.Str(allow_none=True)
    last_name = fields.Str(allow_none=True)

class LoginSchema(Schema):
    """Schema for user login"""
    email = fields.Email(required=True, error_messages={'required': 'Email is required'})
    password = fields.Str(required=True, error_messages={'required': 'Password is required'})

class GoogleOAuthSchema(Schema):
    """Schema for Google OAuth login"""
    id_token = fields.Str(required=True, error_messages={'required': 'Google ID token is required'})

class RefreshTokenSchema(Schema):
    """Schema for token refresh"""
    refresh_token = fields.Str(required=True, error_messages={'required': 'Refresh token is required'})

class UpdateProfileSchema(Schema):
    """Schema for profile update"""
    first_name = fields.Str(allow_none=True)
    last_name = fields.Str(allow_none=True)

class ChangePasswordSchema(Schema):
    """Schema for password change"""
    current_password = fields.Str(required=True, error_messages={'required': 'Current password is required'})
    new_password = fields.Str(required=True, error_messages={'required': 'New password is required'})

