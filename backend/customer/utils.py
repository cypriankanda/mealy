from models import db, Order, Menu
from datetime import datetime, timedelta
import random
import string

def generate_order_id():
    """Generate a unique order ID"""
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f'ORD-{timestamp}-{random_str}'

def get_current_order(customer_id):
    """Get customer's current order (today)"""
    today = datetime.utcnow().date()
    return Order.query.filter(
        db.func.date(Order.created_at) == today,
        Order.customer_id == customer_id
    ).first()

def get_order_history(customer_id, page=1, per_page=10):
    """Get customer's order history with pagination"""
    query = Order.query.filter(
        Order.customer_id == customer_id
    ).order_by(
        Order.created_at.desc()
    )
    
    paginated_orders = query.paginate(page=page, per_page=per_page, error_out=False)
    return paginated_orders