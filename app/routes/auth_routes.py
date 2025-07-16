"""
Authentication routes for user registration and login
Handles JWT token generation and user authentication
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError

from app import db
from app.models import User, Caterer
from app.schemas import register_schema, login_schema, user_schema
from app.utils.jwt_helpers import create_token_response
from app.utils.password_helpers import is_strong_password

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user (customer or admin)

    Request:
    {
        "email": "user@example.com",
        "password": "secure123",
        "role": "customer" | "admin",
        "caterer_id": 1   # optional, for admin only
    }

    Response:
    {
        "access_token": "...",
        "user": {
            "id": 1,
            "email": "user@example.com",
            "role": "admin",
            "caterer_id": 1
        }
    }
    """
    try:
        data = register_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'error': 'Validation failed',
            'message': 'Invalid input data',
            'details': err.messages
        }), 400

    # Validate password
    is_valid, password_error = is_strong_password(data['password'])
    if not is_valid:
        return jsonify({
            'error': 'Weak password',
            'message': password_error
        }), 400

    # Admin user: create or verify caterer
    caterer_id = data.get('caterer_id')
    if data['role'] == 'admin':
        if not caterer_id:
            caterer = Caterer.create_default_caterer()
            caterer_id = caterer.id
        else:
            caterer = Caterer.query.get(caterer_id)
            if not caterer:
                return jsonify({
                    'error': 'Invalid caterer',
                    'message': 'Specified caterer does not exist'
                }), 400

    # Create user
    user, error = User.create_user(
        email=data['email'],
        password=data['password'],
        role=data['role'],
        caterer_id=caterer_id
    )

    if error:
        return jsonify({
            'error': 'Registration failed',
            'message': error
        }), 400

    access_token = create_access_token(identity=str(user.id))
    return jsonify(create_token_response(user, access_token)), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and return access token

    Request:
    {
        "email": "user@example.com",
        "password": "secure123"
    }

    Response:
    {
        "access_token": "...",
        "user": {
            "id": 1,
            "email": "user@example.com",
            "role": "customer",
            "caterer_id": null
        }
    }
    """
    try:
        data = login_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'error': 'Validation failed',
            'message': 'Invalid input data',
            'details': err.messages
        }), 400

    user = User.query.filter_by(email=data['email'].lower().strip()).first()
    if not user or not user.check_password(data['password']):
        return jsonify({
            'error': 'Authentication failed',
            'message': 'Invalid email or password'
        }), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify(create_token_response(user, access_token)), 200


@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    """
    Verify JWT token and return user info

    Headers:
    Authorization: Bearer <access_token>

    Response:
    {
        "user": {
            "id": 1,
            "email": "user@example.com",
            "role": "customer",
            "caterer_id": null
        }
    }
    """
    from app.utils.jwt_helpers import auth_required, get_current_user

    @auth_required
    def _verify():
        user = get_current_user()
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Invalid token'
            }), 401

        return jsonify({
            'user': user_schema.dump(user)
        }), 200

    return _verify()


# Error Handlers
@auth_bp.errorhandler(ValidationError)
def handle_validation_error(error):
    return jsonify({
        'error': 'Validation failed',
        'message': 'Invalid input data',
        'details': error.messages
    }), 400


@auth_bp.errorhandler(500)
def handle_internal_error(error):
    db.session.rollback()
    return jsonify({
        'error': 'Internal server error',
        'message': 'Something went wrong during authentication'
    }), 500
