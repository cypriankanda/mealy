from flask import Blueprint, request, jsonify
from backend.extensions import db, jwt  
from backend.models import User, Order  
from backend.shared.decorators import admin_required  
from auth.utils import register_user, authenticate_user
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    try:
        required_fields = ['email', 'password', 'role']
        if not all(field in data for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400
        
        user = register_user(
            email=data['email'],
            password=data['password'],
            role=data['role'],
            caterer_id=data.get('caterer_id')
        )
        
        access_token = user.get_token()
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'caterer_name': user.caterer_name
            }
        }), 201
    
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    try:
        required_fields = ['email', 'password']
        if not all(field in data for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400
        
        user = authenticate_user(data['email'], data['password'])
        access_token = user.get_token()
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'caterer_name': user.caterer_name
            }
        }), 200
    
    except ValueError as e:
        return jsonify({'message': str(e)}), 401
    except Exception as e:
        return jsonify({'message': 'Login failed'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = get_jwt_identity()
    data = request.get_json()
    
    try:
        user = User.query.get(current_user['id'])
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        if 'email' in data:
            user.email = data['email']
        
        if 'caterer_name' in data and user.role == 'admin':
            user.caterer_name = data['caterer_name']
        
        if 'current_password' in data and 'new_password' in data:
            if not user.check_password(data['current_password']):
                return jsonify({'message': 'Current password is incorrect'}), 400
            user.set_password(data['new_password'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'caterer_name': user.caterer_name
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update profile'}), 500