"""
Meal model for managing caterer's meal offerings
Handles meal CRUD operations and menu management
"""

from datetime import datetime
from app import db

from datetime import datetime
from app import db

class Meal(db.Model):
    """
    Meal model representing individual meal items
    Created and managed by caterers (admin users)
    """
    __tablename__ = 'meals'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Integer, nullable=False)  # Price stored as-is in KES

    caterer_id = db.Column(db.Integer, db.ForeignKey('caterers.id'), nullable=False)

    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders = db.relationship('Order', backref='meal', lazy=True)
    daily_menus = db.relationship('DailyMenuMeal', backref='meal', lazy=True, cascade='all, delete-orphan')

    def __init__(self, name, description, price, caterer_id):
        self.name = name.strip()
        self.description = description.strip()
        self.price = price  # Save KES directly
        self.caterer_id = caterer_id

    @property
    def price_kes(self):
        """Returns price directly in KES"""
        return self.price

    @classmethod
    def create_meal(cls, name, description, price, caterer_id):
        try:
            if not name or not description:
                return None, "Name and description are required"
            if price <= 0:
                return None, "Price must be greater than 0"

            meal = cls(name=name, description=description, price=price, caterer_id=caterer_id)
            db.session.add(meal)
            db.session.commit()
            return meal, None
        except Exception as e:
            db.session.rollback()
            return None, f"Failed to create meal: {str(e)}"

    def update_meal(self, name=None, description=None, price=None):
        try:
            if name:
                self.name = name.strip()
            if description:
                self.description = description.strip()
            if price is not None:
                if price <= 0:
                    return False, "Price must be greater than 0"
                self.price = int(price)  # Ensure price is stored in KES

            self.updated_at = datetime.utcnow()
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    def delete_meal(self):
        try:
            self.is_active = False
            self.updated_at = datetime.utcnow()
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    def hard_delete(self):
        try:
            db.session.delete(self)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price_kes,  # Already in KES
            'caterer_id': self.caterer_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @classmethod
    def get_by_caterer(cls, caterer_id, include_inactive=False):
        query = cls.query.filter_by(caterer_id=caterer_id)
        if not include_inactive:
            query = query.filter_by(is_active=True)
        return query.order_by(cls.created_at.desc()).all()

    def __repr__(self):
        return f'<Meal {self.name} - KES {self.price}>'


class DailyMenu(db.Model):
    """
    Daily menu model for organizing meals by date
    Allows caterers to set specific meals for specific dates
    """
    __tablename__ = 'daily_menus'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, index=True)
    caterer_id = db.Column(db.Integer, db.ForeignKey('caterers.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    meals = db.relationship('DailyMenuMeal', backref='daily_menu', lazy=True, cascade='all, delete-orphan')
    
    # Unique constraint on date and caterer
    __table_args__ = (db.UniqueConstraint('date', 'caterer_id', name='unique_daily_menu'),)
    
    def __init__(self, date, caterer_id):
        self.date = date
        self.caterer_id = caterer_id
    
    @classmethod
    def get_or_create_for_date(cls, date, caterer_id):
        """Get existing daily menu or create new one for date"""
        daily_menu = cls.query.filter_by(date=date, caterer_id=caterer_id).first()
        if not daily_menu:
            daily_menu = cls(date=date, caterer_id=caterer_id)
            db.session.add(daily_menu)
            db.session.commit()
        return daily_menu
    
    def set_meals(self, meal_ids):
        """Set meals for this daily menu"""
        try:
            # It Remove existing meals
            DailyMenuMeal.query.filter_by(daily_menu_id=self.id).delete()
            
            # this will add new meals
            for meal_id in meal_ids:
                daily_menu_meal = DailyMenuMeal(daily_menu_id=self.id, meal_id=meal_id)
                db.session.add(daily_menu_meal)
            
            self.updated_at = datetime.utcnow()
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    def get_meals(self):
        """Get all meals for this daily menu"""
        return [dm.meal for dm in self.meals if dm.meal.is_active]
    
    def to_dict(self):
        """Convert daily menu to dictionary"""
        return {
            'date': self.date.isoformat(),
            'meals': [meal.to_dict() for meal in self.get_meals()]
        }


class DailyMenuMeal(db.Model):
    """
    Association table linking daily menus to meals
    Many-to-many relationship between DailyMenu and Meal
    """
    __tablename__ = 'daily_menu_meals'
    
    id = db.Column(db.Integer, primary_key=True)
    daily_menu_id = db.Column(db.Integer, db.ForeignKey('daily_menus.id'), nullable=False)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    
    # Unique constraint to prevent duplicates
    __table_args__ = (db.UniqueConstraint('daily_menu_id', 'meal_id', name='unique_daily_menu_meal'),)
    
    def __init__(self, daily_menu_id, meal_id):
        self.daily_menu_id = daily_menu_id
        self.meal_id = meal_id