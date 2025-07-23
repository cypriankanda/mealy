from models import db, Meal, Order, Menu
from datetime import datetime, timedelta

def get_dashboard_stats(caterer_id):
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    # Today's orders
    today_orders = Order.query.filter(
        db.func.date(Order.created_at) == today,
        Order.meal.has(caterer_id=caterer_id)
    ).count()
    
    # Yesterday's orders
    yesterday_orders = Order.query.filter(
        db.func.date(Order.created_at) == yesterday,
        Order.meal.has(caterer_id=caterer_id)
    ).count()
    
    # Today's revenue
    today_revenue = db.session.query(
        db.func.sum(Order.price)
    ).filter(
        db.func.date(Order.created_at) == today,
        Order.status != 'cancelled',
        Order.meal.has(caterer_id=caterer_id)
    ).scalar() or 0
    
    # Yesterday's revenue
    yesterday_revenue = db.session.query(
        db.func.sum(Order.price)
    ).filter(
        db.func.date(Order.created_at) == yesterday,
        Order.status != 'cancelled',
        Order.meal.has(caterer_id=caterer_id)
    ).scalar() or 0
    
    # Month orders
    month_start = today.replace(day=1)
    month_orders = Order.query.filter(
        db.func.date(Order.created_at) >= month_start,
        db.func.date(Order.created_at) <= today,
        Order.meal.has(caterer_id=caterer_id)
    ).count()
    
    # Month revenue
    month_revenue = db.session.query(
        db.func.sum(Order.price)
    ).filter(
        db.func.date(Order.created_at) >= month_start,
        db.func.date(Order.created_at) <= today,
        Order.status != 'cancelled',
        Order.meal.has(caterer_id=caterer_id)
    ).scalar() or 0
    
    # Today's cancelled orders
    today_cancelled = Order.query.filter(
        db.func.date(Order.created_at) == today,
        Order.status == 'cancelled',
        Order.meal.has(caterer_id=caterer_id)
    ).count()
    
    # Popular meal (this week)
    week_start = today - timedelta(days=today.weekday())
    popular_meal = db.session.query(
        Meal,
        db.func.count(Order.id).label('order_count'),
        db.func.avg(Order.price).label('avg_price')
    ).join(
        Order, Order.meal_id == Meal.id
    ).filter(
        db.func.date(Order.created_at) >= week_start,
        db.func.date(Order.created_at) <= today,
        Order.meal.has(caterer_id=caterer_id)
    ).group_by(
        Meal.id
    ).order_by(
        db.desc('order_count')
    ).first()
    
    popular_meal_data = None
    if popular_meal:
        meal, order_count, avg_price = popular_meal
        popular_meal_data = {
            'name': meal.name,
            'order_count': order_count,
            'avg_price': float(avg_price) if avg_price else 0
        }
    
    return {
        'today_orders': today_orders,
        'yesterday_orders': yesterday_orders,
        'today_revenue': float(today_revenue),
        'yesterday_revenue': float(yesterday_revenue),
        'month_orders': month_orders,
        'month_revenue': float(month_revenue),
        'today_cancelled': today_cancelled,
        'popular_meal': popular_meal_data
    }