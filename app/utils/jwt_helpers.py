"""
JWT authentication and authorization helpers
Provides decorators for protecting routes and getting current user
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.models import User

def auth_required(f):
    """
    Decorator to require valid JWT token
    Verifies token and adds current user to request context
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'error': 'Authentication required',
                'message': 'Please provide a valid access token'
            }), 401
    
    return decorated_function

def admin_required(f):
    """
    Decorator to require admin role
    Checks both authentication and admin role
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_current_user()
            
            if not current_user:
                return jsonify({
                    'error': 'User not found',
                    'message': 'Invalid user token'
                }), 401
            
            if not current_user.is_admin():
                return jsonify({
                    'error': 'Admin access required',
                    'message': 'This endpoint requires admin privileges'
                }), 403
            
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({
                'error': 'Authentication failed',
                'message': str(e)
            }), 401
    
    return decorated_function

def customer_required(f):
    """
    Decorator to require customer role  
    Ensures only customers can access certain endpoints
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_current_user()
            
            if not current_user:
                return jsonify({
                    'error': 'User not found',
                    'message': 'Invalid user token'
                }), 401
            
            if not current_user.is_customer():
                return jsonify({
                    'error': 'Customer access required',
                    'message': 'This endpoint is for customers only'
                }), 403
            
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({
                'error': 'Authentication failed', 
                'message': str(e)
            }), 401
    
    return decorated_function

def get_current_user():
    """
    Get current authenticated user from JWT token
    Returns User object or None if not found
    """
    try:
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(user_id)
        return None
    except Exception:
        return None

def get_current_user_id():
    """
    Get current user ID from JWT token
    Returns user ID or None
    """
    try:
        return get_jwt_identity()
    except Exception:
        return None

# app/utils/jwt_helpers.py

def create_token_response(user, access_token):
    """
    Clean token response: avoids adding 'token' inside user object
    """
    return {
        'access_token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'caterer_id': user.caterer_id
        }
    }



def verify_caterer_access(caterer_id):
    """
    Verify current user has access to caterer resources
    Returns True if user is admin of the caterer, False otherwise
    """
    current_user = get_current_user()
    if not current_user or not current_user.is_admin():
        return False
    
    return current_user.caterer_id == caterer_id