"""
Password hashing and verification utilities
Uses bcrypt for secure password handling
"""

from app import bcrypt

def hash_password(password):
    """
    Hash a password using bcrypt
    Returns hashed password string
    """
    return bcrypt.generate_password_hash(password).decode('utf-8')

def verify_password(password, password_hash):
    """
    Verify a password against its hash
    Returns True if password matches, False otherwise
    """
    return bcrypt.check_password_hash(password_hash, password)

def is_strong_password(password):
    """
    Check if password meets security requirements
    Returns (is_valid, error_message) tuple
    """
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    
    if len(password) > 128:
        return False, "Password must be less than 128 characters"
    
    # Check for at least one letter and one number (optional - can be enabled)
    # has_letter = any(c.isalpha() for c in password)
    # has_number = any(c.isdigit() for c in password)
    # 
    # if not (has_letter and has_number):
    #     return False, "Password must contain at least one letter and one number"
    
    return True, None