"""
Order model for handling customer meal orders
Manages order lifecycle from creation to delivery
"""

from datetime import datetime, date
from app import db
from sqlalchemy import func

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
        self.price = int(price * 100) if isinstance(price, float) else price  # Convert to cents
        self.special_instructions = special_instructions
    
    @property
    def price_kes(self):
        """Get price in KES (from cents)"""
        return self.price / 100
    
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
    def get_dashboard_stats(cls, caterer_id, date_filter=None):
        """Get dashboard statistics for admin"""
        # Base query filtered by caterer
        base_query = cls.query.join(cls.meal).filter_by(caterer_id=caterer_id)
        
        if date_filter:
            base_query = base_query.filter(cls.menu_date == date_filter)
        else:
            # Default to today
            base_query = base_query.filter(cls.menu_date == date.today())
        
        # Get counts and revenue
        total_orders = base_query.count()
        confirmed_orders = base_query.filter(cls.status != 'cancelled').count()
        total_revenue = base_query.filter(cls.status != 'cancelled')\
            .with_entities(func.sum(cls.price)).scalar() or 0
        
        # Get status breakdown
        status_counts = {}
        for status in ['confirmed', 'preparing', 'ready', 'delivered', 'cancelled']:
            count = base_query.filter(cls.status == status).count()
            status_counts[status] = count
        
        return {
            'total_orders': total_orders,
            'confirmed_orders': confirmed_orders,
            'total_revenue': total_revenue / 100,  # Convert to Kenya shillings
            'status_counts': status_counts
        }
    
    @classmethod
    def get_top_meal(cls, caterer_id, days=7):
        """Get the top selling meal for a caterer in the last N days"""
        start_date = date.today() - timedelta(days=days)
    
        result = cls.query.join(cls.meal)\
             .filter_by(caterer_id=caterer_id)\
             .filter(cls.menu_date >= start_date)\
             .filter(cls.status != 'cancelled')\
             .with_entities(
                 cls.meal_id,
                 Meal.name.label('meal_name'),
                 func.count(cls.id).label('order_count'),
                 func.avg(cls.price).label('average_price')
        )\
        .group_by(cls.meal_id, Meal.name)\
        .order_by(func.count(cls.id).desc())\
        .first()
    
        if result:
            return {
            'meal_id': result.meal_id,
            'meal_name': result.meal_name,
            'order_count': result.order_count,
            'average_price': result.average_price / 100  # Convert from cents
        }
        return None

    def __repr__(self):
        return f'<Order {self.id} - {self.status} - KES {self.price_kes}>'