from datetime import datetime
from flask_bcrypt import Bcrypt
from sqlalchemy.sql import func

# Import db instance from models package
from . import db

# Initialize bcrypt for password hashing
bcrypt = Bcrypt()

class User(db.Model):
    """
    User model for authentication and user management
    
    This model supports both email/password and Google OAuth authentication.
    Users can register with email/password or link their Google account.
    """
    
    __tablename__ = 'users'
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True)
    
    # Email authentication fields
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for Google OAuth users
    
    # Google OAuth fields
    google_id = db.Column(db.String(255), unique=True, nullable=True, index=True)
    google_email = db.Column(db.String(120), nullable=True)
    google_name = db.Column(db.String(255), nullable=True)
    google_picture = db.Column(db.String(500), nullable=True)
    
    # User profile fields
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    # Add relationships here when you have other models (e.g., user_generated_descriptions)
    
    def __init__(self, **kwargs):
        """Initialize user with password hashing if password is provided"""
        if 'password' in kwargs:
            kwargs['password_hash'] = self._hash_password(kwargs.pop('password'))
        super(User, self).__init__(**kwargs)
    
    def _hash_password(self, password):
        """Hash password using bcrypt"""
        return bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Verify password against stored hash"""
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'has_google_account': bool(self.google_id),
            'has_password': bool(self.password_hash)
        }
    
    def to_public_dict(self):
        """Convert user to public dictionary (without sensitive info)"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_verified': self.is_verified,
            'has_google_account': bool(self.google_id)
        }
    
    @classmethod
    def find_by_email(cls, email):
        """Find user by email"""
        return cls.query.filter_by(email=email).first()
    
    @classmethod
    def find_by_google_id(cls, google_id):
        """Find user by Google ID"""
        return cls.query.filter_by(google_id=google_id).first()
    
    @classmethod
    def create_user(cls, email, password=None, **kwargs):
        """Create a new user"""
        user = cls(email=email, password=password, **kwargs)
        db.session.add(user)
        db.session.commit()
        return user
    
    def __repr__(self):
        return f'<User {self.email}>' 