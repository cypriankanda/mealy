"""
Admin routes for caterer management functionality
Handles meal management, order tracking, and dashboard analytics
"""

from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from datetime import date, datetime

from app import db
from app.models import Meal, Order, DailyMenu
from app.schemas import (
    meal_create_schema, meal_update_schema, meals_schema, meal_schema,
    admin_orders_schema, order_update_status_schema, dashboard_stats_schema,
    daily_menu_create_schema, order_filter_schema
)
from app.utils.jwt_helpers import admin_required, get_current_user
from app.utils.pagination import paginate_query, create_pagination_response

# Create admin blueprint
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard():
    """Get dashboard statistics for admin"""
    user = get_current_user()
    today = date.today()
    
    # Get dashboard statisticss
    stats = Order.get_dashboard_stats(user.caterer_id, today)
    
    return jsonify(stats), 200
def dashboard_stats():
    date_filter = request.args.get('date')
    if date_filter:
        try:
            date_filter = datetime.strptime(date_filter, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    
    stats = Order.get_dashboard_stats(current_user.id, date_filter)
    return jsonify(stats)

@admin_bp.route('/meals', methods=['GET'])
@admin_required
def get_meals():
    """Get all meals for current caterer"""
    user = get_current_user()
    meals = Meal.get_by_caterer(user.caterer_id)
    
    return jsonify(meals_schema.dump(meals)), 200

@admin_bp.route('/meals', methods=['POST'])
@admin_required
def create_meal():
    """Create new meal"""
    user = get_current_user()
    
    try:
        data = meal_create_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    
    meal, error = Meal.create_meal(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        caterer_id=user.caterer_id
    )
    
    if error:
        return jsonify({'error': 'Creation failed', 'message': error}), 400
    
    return jsonify(meal_schema.dump(meal)), 201

@admin_bp.route('/meals/<int:meal_id>', methods=['PUT'])
@admin_required
def update_meal(meal_id):
    """Update existing meal"""
    user = get_current_user()
    
    meal = Meal.query.filter_by(id=meal_id, caterer_id=user.caterer_id).first()
    if not meal:
        return jsonify({'error': 'Meal not found'}), 404
    
    try:
        data = meal_update_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    
    success, error = meal.update_meal(**data)
    if not success:
        return jsonify({'error': 'Update failed', 'message': error}), 400
    
    return jsonify(meal_schema.dump(meal)), 200

@admin_bp.route('/meals/<int:meal_id>', methods=['DELETE'])
@admin_required
def delete_meal(meal_id):
    """Delete meal"""
    user = get_current_user()
    
    meal = Meal.query.filter_by(id=meal_id, caterer_id=user.caterer_id).first()
    if not meal:
        return jsonify({'error': 'Meal not found'}), 404
    
    success, error = meal.hard_delete()
    if not success:
        return jsonify({'error': 'Delete failed', 'message': error}), 400
    
    return jsonify({'message': 'Meal deleted successfully'}), 200

@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    """Get all orders for caterer with filtering"""
    user = get_current_user()
    
    try:
        filters = order_filter_schema.load(request.args)
    except ValidationError as err:
        return jsonify({'error': 'Invalid filters', 'details': err.messages}), 400
    
    pagination = Order.get_admin_orders(
        caterer_id=user.caterer_id,
        page=filters.get('page', 1),
        per_page=filters.get('per_page', 20),
        status_filter=filters.get('status'),
        date_filter=filters.get('date')
    )
    
    # Convert to admin format
    orders_data = []
    for order in pagination.items:
        orders_data.append({
            'order_id': order.id,
            'customer_email': order.customer.email,
            'meal_name': order.meal.name,
            'price': order.price_kes,
            'menu_date': order.menu_date.isoformat(),
            'status': order.status,
            'created_at': order.created_at.isoformat()
        })
    
    return jsonify({
        'data': orders_data,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    """Update order status"""
    user = get_current_user()
    
    # Find order and verify it belongs to this caterer
    order = Order.query.join(Meal).filter(
        Order.id == order_id,
        Meal.caterer_id == user.caterer_id
    ).first()
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    try:
        data = order_update_status_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    
    success, error = order.update_status(data['status'])
    if not success:
        return jsonify({'error': 'Status update failed', 'message': error}), 400
    
    return jsonify({'message': 'Order status updated successfully'}), 200

@admin_bp.route('/meals/top')
@admin_required
def get_top_meal():
    caterer_id = current_user.id
    top_meal = Order.get_top_meal(caterer_id)
    return jsonify(top_meal if top_meal else {})