from flask import Blueprint, request, jsonify
from backend.extensions import db, jwt  # Use absolute imports
from backend.models import User, Order  # Example model imports
from backend.shared.decorators import customer_required  
from datetime import datetime, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity
from customer.utils import generate_order_id, get_current_order, get_order_history

customer_bp = Blueprint('customer', __name__)

@customer_bp.route('/menu/today', methods=['GET'])
@jwt_required()
def get_todays_menu():
    today = datetime.utcnow().date()
    menu_items = Menu.query.filter(Menu.date == today).all()
    meals = [item.meal.to_dict() for item in menu_items]
    return jsonify({'meals': meals}), 200

@customer_bp.route('/menu/<date>', methods=['GET'])
@jwt_required()
def get_menu_by_date(date):
    try:
        menu_date = datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    menu_items = Menu.query.filter(Menu.date == menu_date).all()
    meals = [item.meal.to_dict() for item in menu_items]
    return jsonify({'meals': meals}), 200

@customer_bp.route('/orders/current', methods=['GET'])
@jwt_required()
@customer_required
def get_current_order():
    current_user = get_jwt_identity()
    order = get_current_order(current_user['id'])
    
    if not order:
        return jsonify({'message': 'No current order'}), 404
    
    return jsonify(order.to_dict()), 200

@customer_bp.route('/orders', methods=['POST'])
@jwt_required()
@customer_required
def create_order():
    current_user = get_jwt_identity()
    data = request.get_json()
    
    if 'meal_id' not in data:
        return jsonify({'message': 'Meal ID is required'}), 400
    
    # Check if user already has an order today
    existing_order = get_current_order(current_user['id'])
    if existing_order:
        return jsonify({'message': 'You already have an order for today'}), 400
    
    # Get the meal
    meal = Meal.query.filter_by(id=data['meal_id'], is_active=True).first()
    if not meal:
        return jsonify({'message': 'Meal not found or unavailable'}), 404
    
    # Check if meal is on today's menu
    today = datetime.utcnow().date()
    menu_item = Menu.query.filter_by(date=today, meal_id=meal.id).first()
    if not menu_item:
        return jsonify({'message': 'Meal not available today'}), 400
    
    try:
        order = Order(
            order_id=generate_order_id(),
            status='confirmed',
            price=meal.price,
            customer_id=current_user['id'],
            meal_id=meal.id
        )
        db.session.add(order)
        db.session.commit()
        
        return jsonify(order.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create order'}), 500

@customer_bp.route('/orders/<order_id>', methods=['DELETE'])
@jwt_required()
@customer_required
def cancel_order(order_id):
    current_user = get_jwt_identity()
    
    order = Order.query.filter_by(
        order_id=order_id,
        customer_id=current_user['id']
    ).first()
    
    if not order:
        return jsonify({'message': 'Order not found'}), 404
    
    # Only allow cancelling if order is not already delivered or cancelled
    if order.status in ['delivered', 'cancelled']:
        return jsonify({'message': 'Cannot cancel this order'}), 400
    
    try:
        order.status = 'cancelled'
        db.session.commit()
        return jsonify({'message': 'Order cancelled'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to cancel order'}), 500

@customer_bp.route('/orders/history', methods=['GET'])
@jwt_required()
@customer_required
def get_order_history():
    current_user = get_jwt_identity()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    paginated_orders = get_order_history(current_user['id'], page, per_page)
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