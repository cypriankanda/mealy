from flask_jwt_extended import create_access_token
from models import User, db
from werkzeug.security import generate_password_hash
from datetime import datetime
import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password meets requirements"""
    if len(password) < 8:
        return False
    return True

def register_user(email, password, role, caterer_id=None):
    """Register a new user"""
    if not validate_email(email):
        raise ValueError('Invalid email format')
    
    if not validate_password(password):
        raise ValueError('Password must be at least 8 characters long')
    
    if User.query.filter_by(email=email).first():
        raise ValueError('Email already registered')
    
    user = User(email=email, role=role)
    user.set_password(password)
    
    if role == 'customer' and caterer_id:
        user.caterer_id = caterer_id
    
    db.session.add(user)
    db.session.commit()
    
    return user

def authenticate_user(email, password):
    """Authenticate a user"""
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        raise ValueError('Invalid email or password')
    
    return user