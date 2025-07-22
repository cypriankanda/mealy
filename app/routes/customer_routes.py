"""
Customer-facing routes for menu viewing, ordering, and profile management
Handles all customer interactions with the catering platform
"""

from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from datetime import date, datetime

from app import db
from app.models import User, Meal, Order, DailyMenu
from app.schemas import (
    profile_update_schema, user_schema, menu_schema,
    order_create_schema, order_schema, order_history_list_schema,
    order_filter_schema, meal_schema, meals_schema
)
from app.utils.jwt_helpers import auth_required, get_current_user, customer_required
from app.utils.pagination import paginate_query, create_pagination_response

# Create customer blueprint
customer_bp = Blueprint('customer', __name__)

@customer_bp.route('/profile', methods=['GET'])
@auth_required
def get_profile():
    """
    Get current user's profile information
    
    Returns:
    {
        "id": 1,
        "email": "user@example.com",
        "role": "customer",
        "caterer_id": null,
        "caterer_name": null
    }
    """
    user = get_current_user()
    if not user:
        return jsonify({
            'error': 'User not found',
            'message': 'Invalid token'
        }), 401
    
    # Build profile data including caterer name for admin users
    profile_data = user.to_dict()
    
    return jsonify(profile_data), 200

@customer_bp.route('/profile', methods=['PUT'])
@auth_required  
def update_profile():
    """
    Update current user's profile
    
    Expected JSON:
    {
        "email": "new@example.com",  // optional
        "current_password": "current123",  // required for password change
        "new_password": "newpass123",  // optional
        "caterer_name": "New Name"  // optional, admin only
    }
    
    Returns:
    {
        "message": "Profile updated successfully",
        "user": { user_data }
    }
    """
    user = get_current_user()
    if not user:
        return jsonify({
            'error': 'User not found',
            'message': 'Invalid token'
        }), 401
    
    try:
        # Validate request data
        data = profile_update_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'error': 'Validation failed',
            'message': 'Invalid input data',
            'details': err.messages
        }), 400
    
    # Handle password change
    if data.get('new_password'):
        if not data.get('current_password'):
            return jsonify({
                'error': 'Current password required',
                'message': 'Current password is required to change password'
            }), 400
        
        success, error = user.change_password(
            data['current_password'], 
            data['new_password']
        )
        if not success:
            return jsonify({
                'error': 'Password change failed',
                'message': error
            }), 400
    
    # Handle profile updates
    if data.get('email') or data.get('caterer_name'):
        success, error = user.update_profile(
            email=data.get('email'),
            caterer_name=data.get('caterer_name')
        )
        if not success:
            return jsonify({
                'error': 'Profile update failed',
                'message': error
            }), 400
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200

@customer_bp.route('/menu/today', methods=['GET'])
def get_todays_menu():
    """
    Get today's available meals (menu for today)
    Open endpoint - no authentication required
    
    Returns:
    {
        "date": "2024-01-15",
        "meals": [
            {
                "id": 1,
                "name": "Beef Stew with Rice", 
                "description": "Slow-cooked beef...",
                "price": 450.0,
                "caterer_id": 1
            }
        ]
    }
    """
    today = date.today()
    
    # Get daily menu for today or fall back to all active meals
    daily_menu = DailyMenu.query.filter_by(date=today).first()
    
    if daily_menu and daily_menu.meals:
        # Get meals from daily menu
        meals = [dm.meal for dm in daily_menu.meals if dm.meal.is_active]
    else:
        # Fall back to all active meals if no daily menu set
        meals = Meal.query.filter_by(is_active=True).all()
    
    menu_data = {
        'date': today.isoformat(),
        'meals': meals_schema.dump(meals)
    }
    
    return jsonify(menu_data), 200

@customer_bp.route('/menu/<date_str>', methods=['GET'])
def get_menu_for_date(date_str):
    """
    Get menu for a specific date
    
    URL: /api/menu/2024-01-15
    
    Returns:
    {
        "date": "2024-01-15",
        "meals": [ meal_objects ]
    }
    """
    try:
        menu_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({
            'error': 'Invalid date format',
            'message': 'Date must be in YYYY-MM-DD format'
        }), 400
    
    # Get daily menu for the date
    daily_menu = DailyMenu.query.filter_by(date=menu_date).first()
    
    if not daily_menu:
        return jsonify({
            'error': 'No menu found',
            'message': f'No menu set for {date_str}'
        }), 404
    
    meals = [dm.meal for dm in daily_menu.meals if dm.meal.is_active]
    
    menu_data = {
        'date': menu_date.isoformat(),
        'meals': meals_schema.dump(meals)
    }
    
    return jsonify(menu_data), 200

@customer_bp.route('/orders', methods=['POST'])
@customer_required
def place_order():
    """
    Place a new meal order
    
    Expected JSON:
    {
        "meal_id": 1,
        "special_instructions": "No onions please"  // optional
    }
    
    Returns:
    {
        "order_id": 123,
        "user_id": 1,
        "meal_id": 1,
        "menu_date": "2024-01-15",
        "status": "confirmed"
    }
    """
    user = get_current_user()
    
    try:
        # Validate request data
        data = order_create_schema.load(request.json)
    except ValidationError as err:
        return jsonify({
            'error': 'Validation failed',
            'message': 'Invalid input data',
            'details': err.messages
        }), 400
    
    # Verify meal exists and is active
    meal = Meal.query.get(data['meal_id'])
    if not meal or not meal.is_active:
        return jsonify({
            'error': 'Meal not found',
            'message': 'Selected meal is not available'
        }), 404
    
    # Check if user already has an order for today
    today = date.today()
    existing_order = Order.get_current_order(user.id, today)
    if existing_order:
        return jsonify({
            'error': 'Order already exists',
            'message': 'You already have an order for today'
        }), 400
    
    # Create order
    order, error = Order.create_order(
        user_id=user.id,
        meal_id=meal.id,
        menu_date=today,
        price=meal.price,
        special_instructions=data.get('special_instructions')
    )
    
    if error:
        return jsonify({
            'error': 'Order creation failed',
            'message': error
        }), 400
    
    # Return order response matching frontend expectations
    return jsonify({
        'order_id': order.id,
        'user_id': order.user_id,
        'meal_id': order.meal_id,
        'menu_date': order.menu_date.isoformat(),
        'status': order.status
    }), 201

@customer_bp.route('/orders/current', methods=['GET'])
@customer_required
def get_current_order():
    """
    Get customer's current active order for today
    
    Returns:
    {
        "order_id": 123,
        "meal_id": 1,
        "meal_name": "Beef Stew with Rice",
        "status": "confirmed"
    }
    or null if no current order
    """
    user = get_current_user()
    today = date.today()
    
    current_order = Order.get_current_order(user.id, today)
    
    if not current_order:
        return jsonify(None), 200
    
    # Return current order in format expected by frontend
    return jsonify({
        'order_id': current_order.id,
        'meal_id': current_order.meal_id,
        'meal_name': current_order.meal.name if current_order.meal else None,
        'menu_date': current_order.menu_date.isoformat() if current_order.menu_date else None,
        'price': current_order.price_kes,
        'created_at': current_order.created_at.isoformat() if current_order.created_at else None,
        'status': current_order.status
    }), 200

@customer_bp.route('/orders/<int:order_id>', methods=['DELETE'])
@customer_required
def cancel_order(order_id):
    """
    Cancel a customer's order
    
    URL: DELETE /api/orders/123
    
    Returns:
    {
        "message": "Order cancelled successfully"
    }
    """
    user = get_current_user()
    
    # Find order and verify ownership
    order = Order.query.get(order_id)
    if not order:
        return jsonify({
            'error': 'Order not found',
            'message': 'Order does not exist'
        }), 404
    
    if order.user_id != user.id:
        return jsonify({
            'error': 'Access denied',
            'message': 'You can only cancel your own orders'
        }), 403
    
    # Cancel order
    success, error = order.cancel_order()
    if not success:
        return jsonify({
            'error': 'Cancellation failed',
            'message': error
        }), 400
    
    return jsonify({
        'message': 'Order cancelled successfully'
    }), 200

@customer_bp.route('/orders/history', methods=['GET'])
@customer_required
def get_order_history():
    """
    Get customer's order history with pagination
    
    Query params:
    - page: page number (default 1)
    - per_page: items per page (default 10, max 50)
    
    Returns:
    {
        "data": [
            {
                "order_id": 123,
                "meal_name": "Beef Stew with Rice",
                "price": 450.0,
                "menu_date": "2024-01-15", 
                "status": "delivered"
            }
        ],
        "pagination": {
            "page": 1,
            "per_page": 10,
            "total": 25,
            "pages": 3,
            "has_next": true,
            "has_prev": false
        }
    }
    """
    user = get_current_user()
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 50)
    
    # Get paginated order history
    pagination = Order.get_user_order_history(user.id, page, per_page)
    
    # Convert orders to history format
    history_data = []
    for order in pagination.items:
        history_data.append({
            'order_id': order.id,
            'meal_name': order.meal.name if order.meal else None,
            'price': order.price_kes,
            'menu_date': order.menu_date.isoformat(),
            'status': order.status,
            'created_at': order.created_at.isoformat()
        })
    
    return jsonify({
        'data': history_data,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev,
            'next_num': pagination.next_num,
            'prev_num': pagination.prev_num
        }
    }), 200

# Error handlers for customer blueprint
@customer_bp.errorhandler(ValidationError)
def handle_validation_error(error):
    """Handle marshmallow validation errors"""
    return jsonify({
        'error': 'Validation failed',
        'message': 'Invalid input data',
        'details': error.messages
    }), 400

@customer_bp.errorhandler(500)
def handle_internal_error(error):
    """Handle internal server errors"""
    db.session.rollback()
    return jsonify({
        'error': 'Internal server error',
        'message': 'Something went wrong'
    }), 500