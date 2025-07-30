"""
Order model for handling customer meal orders
Manages order lifecycle from creation to delivery
"""

from datetime import datetime, date, timedelta
from app import db
from sqlalchemy import func
from app.models.meal import Meal

class Order(db.Model):
    """
    Order model representing customer meal orders
    Tracks order status and manages order lifecycle
    """
    __tablename__ = 'orders'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    
    # Order details
    menu_date = db.Column(db.Date, nullable=False, index=True)  # Date the meal is for
    price = db.Column(db.Integer, nullable=False)  # Price in cents at time of order
    status = db.Column(
        db.Enum('confirmed', 'preparing', 'ready', 'delivered', 'cancelled', name='order_status'),
        default='confirmed',
        nullable=False,
        index=True
    )
    
    # Additional order information
    special_instructions = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, user_id, meal_id, menu_date, price, special_instructions=None):
        """Initialize order with required fields"""
        self.user_id = user_id
        self.meal_id = meal_id
        self.menu_date = menu_date
        self.price =int(price)
        self.special_instructions = special_instructions
    
    @property
    def price_kes(self):
        """Get price in KES """
        return self.price
    
    @classmethod
    def create_order(cls, user_id, meal_id, menu_date, price, special_instructions=None):
        """
        Create new order with validation
        Returns (order, error_message) tuple
        """
        try:
            # Check if user already has an order for this date
            existing_order = cls.query.filter_by(
                user_id=user_id,
                menu_date=menu_date,
                status='confirmed'
            ).first()
            
            if existing_order:
                return None, "You already have an order for this date"
            
            # Create new order
            order = cls(
                user_id=user_id,
                meal_id=meal_id,
                menu_date=menu_date,
                price=price,
                special_instructions=special_instructions
            )
            
            db.session.add(order)
            db.session.commit()
            return order, None
            
        except Exception as e:
            db.session.rollback()
            return None, f"Failed to create order: {str(e)}"
    
    def update_status(self, new_status):
        """Update order status with validation"""
        valid_statuses = ['confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
        
        if new_status not in valid_statuses:
            return False, f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        
        # Validate status transitions
        current_status = self.status
        
        # Define valid transitions
        valid_transitions = {
            'confirmed': ['preparing', 'cancelled'],
            'preparing': ['ready', 'cancelled'],
            'ready': ['delivered', 'cancelled'],
            'delivered': [],  # Terminal state
            'cancelled': []   # Terminal state
        }
        
        if new_status not in valid_transitions.get(current_status, []):
            return False, f"Cannot change status from {current_status} to {new_status}"
        
        try:
            self.status = new_status
            self.updated_at = datetime.utcnow()
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    def cancel_order(self):
        """Cancel the order if allowed"""
        if self.status in ['delivered', 'cancelled']:
            return False, f"Cannot cancel order with status: {self.status}"
        
        return self.update_status('cancelled')
    
    def to_dict(self):
        """Convert order to dictionary for JSON serialization"""
        return {
            'order_id': self.id,
            'user_id': self.user_id,
            'meal_id': self.meal_id,
            'meal_name': self.meal.name if self.meal else None,
            'price': self.price_kes,
            'menu_date': self.menu_date.isoformat(),
            'status': self.status,
            'special_instructions': self.special_instructions,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def to_admin_dict(self):
        """Convert order to dictionary with customer info for admin view"""
        return {
            'order_id': self.id,
            'customer_email': self.customer.email if self.customer else None,
            'meal_name': self.meal.name if self.meal else None,
            'price': self.price_kes,
            'menu_date': self.menu_date.isoformat(),
            'status': self.status,
            'special_instructions': self.special_instructions,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def to_history_dict(self):
        """Convert order to dictionary for order history view"""
        return {
            'order_id': self.id,
            'meal_name': self.meal.name if self.meal else None,
            'price': self.price_kes,
            'menu_date': self.menu_date.isoformat(),
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
    
    @classmethod
    def get_current_order(cls, user_id, menu_date=None):
        """Get user's current active order for a date"""
        if menu_date is None:
            menu_date = date.today()
        
        return cls.query.filter_by(
            user_id=user_id,
            menu_date=menu_date
        ).filter(cls.status.in_(['confirmed', 'preparing', 'ready'])).first()
    
    @classmethod
    def get_user_order_history(cls, user_id, page=1, per_page=10):
        """Get paginated order history for a user"""
        return cls.query.filter_by(user_id=user_id)\
            .order_by(cls.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
    
    @classmethod
    def get_admin_orders(cls, caterer_id, page=1, per_page=20, status_filter=None, date_filter=None):
        """Get paginated orders for admin view"""
        # Join with meal to filter by caterer
        query = cls.query.join(cls.meal).filter_by(caterer_id=caterer_id)
        
        # Apply filters
        if status_filter:
            query = query.filter(cls.status == status_filter)
        
        if date_filter:
            query = query.filter(cls.menu_date == date_filter)
        
        return query.order_by(cls.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
    
    @classmethod
    def get_dashboard_stats(cls, caterer_id):
        """Get comprehensive dashboard statistics"""
        today = date.today()
        yesterday = today - timedelta(days=1)
        first_day_of_month = today.replace(day=1)
        
        # Start of week (Monday)
        start_of_week = today - timedelta(days=today.weekday())
        
        # Today's stats
        today_stats = cls.query.join(cls.meal).filter(
            Meal.caterer_id == caterer_id,
            cls.menu_date == today
        ).with_entities(
            func.count(cls.id).label('total_orders'),
            func.sum(cls.price).filter(cls.status != 'cancelled').label('total_revenue'),
            func.count().filter(cls.status == 'cancelled').label('cancelled_orders')
        ).first()
        
        # Yesterday's stats
        yesterday_stats = cls.query.join(cls.meal).filter(
            Meal.caterer_id == caterer_id,
            cls.menu_date == yesterday
        ).with_entities(
            func.count(cls.id).label('total_orders'),
            func.sum(cls.price).filter(cls.status != 'cancelled').label('total_revenue')
        ).first()
        
        # Month stats
        month_stats = cls.query.join(cls.meal).filter(
            Meal.caterer_id == caterer_id,
            cls.menu_date >= first_day_of_month,
            cls.menu_date <= today
        ).with_entities(
            func.count(cls.id).label('total_orders'),
            func.sum(cls.price).filter(cls.status != 'cancelled').label('total_revenue')
        ).first()
        
        # Most popular meal this week
        popular_meal = db.session.query(
            Meal.name,
            func.count(cls.id).label('order_count'),
            func.avg(cls.price).label('avg_price')
        ).join(cls.meal).filter(
            Meal.caterer_id == caterer_id,
            cls.menu_date >= start_of_week,
            cls.status != 'cancelled'
        ).group_by(Meal.id).order_by(func.count(cls.id).desc()).first()
        
        return {
            'today_orders': today_stats[0] or 0,
            'today_revenue': today_stats[1] or 0,
            'today_cancelled': today_stats[2] or 0,
            'yesterday_orders': yesterday_stats[0] or 0,
            'yesterday_revenue': yesterday_stats[1] or 0,
            'month_orders': month_stats[0] or 0,
            'month_revenue': month_stats[1] or 0,
            'popular_meal': {
                'name': popular_meal[0],
                'order_count': popular_meal[1],
                'avg_price': round(popular_meal[2] or 0)
            } if popular_meal else None
        }
    
    def __repr__(self):
        return f'<Order {self.id} - {self.status} - KES {self.price_kes}>'