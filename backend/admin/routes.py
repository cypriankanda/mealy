from flask import Blueprint, request, jsonify
from backend.extensions import db, jwt  
from backend.models import User, Order  
from backend.shared.decorators import admin_required  
from datetime import datetime, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity
from admin.utils import get_dashboard_stats


admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def dashboard():
    current_user = get_jwt_identity()
    stats = get_dashboard_stats(current_user['id'])
    return jsonify(stats), 200

@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
@admin_required
def get_orders():
    current_user = get_jwt_identity()
    status = request.args.get('status')
    per_page = int(request.args.get('per_page', 10))
    page = int(request.args.get('page', 1))
    
    query = Order.query.filter(Order.meal.has(caterer_id=current_user['id']))
    
    if status:
        statuses = status.split(',')
        query = query.filter(Order.status.in_(statuses))
    
    paginated_orders = query.order_by(
        Order.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    orders = [order.to_dict() for order in paginated_orders.items]
    
    return jsonify({
        'data': orders,
        'pagination': {
            'page': paginated_orders.page,
            'per_page': paginated_orders.per_page,
            'total': paginated_orders.total,
            'pages': paginated_orders.pages
        }
    }), 200

@admin_bp.route('/orders/<order_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_order_status(order_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'message': 'Status is required'}), 400
    
    order = Order.query.filter_by(
        order_id=order_id,
        meal=Meal.query.filter_by(caterer_id=current_user['id'])
    ).first()
    
    if not order:
        return jsonify({'message': 'Order not found'}), 404
    
    valid_statuses = ['confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
    if data['status'] not in valid_statuses:
        return jsonify({'message': 'Invalid status'}), 400
    
    order.status = data['status']
    db.session.commit()
    
    return jsonify(order.to_dict()), 200

@admin_bp.route('/meals', methods=['GET'])
@jwt_required()
@admin_required
def get_meals():
    current_user = get_jwt_identity()
    meals = Meal.query.filter_by(caterer_id=current_user['id']).all()
    return jsonify([meal.to_dict() for meal in meals]), 200

@admin_bp.route('/meals', methods=['POST'])
@jwt_required()
@admin_required
def create_meal():
    current_user = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['name', 'description', 'price']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        meal = Meal(
            name=data['name'],
            description=data['description'],
            price=float(data['price']),
            caterer_id=current_user['id']
        )
        db.session.add(meal)
        db.session.commit()
        
        return jsonify(meal.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create meal'}), 500

@admin_bp.route('/meals/<int:meal_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_meal(meal_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    
    meal = Meal.query.filter_by(
        id=meal_id,
        caterer_id=current_user['id']
    ).first()
    
    if not meal:
        return jsonify({'message': 'Meal not found'}), 404
    
    try:
        if 'name' in data:
            meal.name = data['name']
        if 'description' in data:
            meal.description = data['description']
        if 'price' in data:
            meal.price = float(data['price'])
        if 'is_active' in data:
            meal.is_active = bool(data['is_active'])
        
        db.session.commit()
        return jsonify(meal.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update meal'}), 500

@admin_bp.route('/meals/<int:meal_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_meal(meal_id):
    current_user = get_jwt_identity()
    
    meal = Meal.query.filter_by(
        id=meal_id,
        caterer_id=current_user['id']
    ).first()
    
    if not meal:
        return jsonify({'message': 'Meal not found'}), 404
    
    try:
        # Instead of deleting, mark as inactive
        meal.is_active = False
        db.session.commit()
        return jsonify({'message': 'Meal marked as unavailable'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update meal'}), 500

@admin_bp.route('/menu/today', methods=['GET'])
@jwt_required()
@admin_required
def get_todays_menu():
    current_user = get_jwt_identity()
    today = datetime.utcnow().date()
    
    menu_items = Menu.query.filter(
        Menu.date == today,
        Menu.meal.has(caterer_id=current_user['id'])
    ).all()
    
    meals = [item.meal.to_dict() for item in menu_items]
    return jsonify({'meals': meals}), 200

@admin_bp.route('/menu/<date>', methods=['GET'])
@jwt_required()
@admin_required
def get_menu_by_date(date):
    current_user = get_jwt_identity()
    
    try:
        menu_date = datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    menu_items = Menu.query.filter(
        Menu.date == menu_date,
        Menu.meal.has(caterer_id=current_user['id'])
    ).all()
    
    meals = [item.meal.to_dict() for item in menu_items]
    return jsonify({'meals': meals}), 200