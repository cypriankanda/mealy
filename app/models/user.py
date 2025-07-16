"""
User model for authentication and profile management
Supports both customer and admin (caterer) roles
"""

from datetime import datetime
from app import db, bcrypt
from sqlalchemy.exc import IntegrityError

class User(db.Model):
    """
    User model for customers and admin caterers
    Handles authentication, profile data, and role-based access
    """
    __tablename__ = 'users'
    
    # Primary fields
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.Enum('customer', 'admin', name='user_roles'), nullable=False, default='customer')
    
    # Admin-specific fields (for caterers)
    caterer_id = db.Column(db.Integer, db.ForeignKey('caterers.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    caterer = db.relationship('Caterer', backref=db.backref('users', lazy=True))
    orders = db.relationship('Order', backref='customer', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, email, password, role='customer', caterer_id=None):
        """Initialize user with hashed password"""
        self.email = email.lower().strip()
        self.set_password(password)
        self.role = role
        self.caterer_id = caterer_id
    
    def set_password(self, password):
        """Hash and set user password using bcrypt"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Verify password against stored hash"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        """Check if user has admin role"""
        return self.role == 'admin'
    
    def is_customer(self):
        """Check if user has customer role"""
        return self.role == 'customer'
    
    @classmethod
    def create_user(cls, email, password, role='customer', caterer_id=None):
        """
        Create new user with validation
        Returns (user, error_message) tuple
        """
        try:
            # Check if email already exists
            if cls.query.filter_by(email=email.lower().strip()).first():
                return None, "Email already registered"
            
            # Create new user
            user = cls(email=email, password=password, role=role, caterer_id=caterer_id)
            db.session.add(user)
            db.session.commit()
            return user, None
            
        except IntegrityError:
            db.session.rollback()
            return None, "Email already registered"
        except Exception as e:
            db.session.rollback()
            return None, f"Registration failed: {str(e)}"
    
    def update_profile(self, email=None, caterer_name=None):
        """Update user profile information"""
        try:
            if email and email != self.email:
                # Check if new email is already taken
                existing_user = User.query.filter_by(email=email.lower().strip()).first()
                if existing_user and existing_user.id != self.id:
                    return False, "Email already in use"
                self.email = email.lower().strip()
            
            if caterer_name and self.caterer:
                self.caterer.name = caterer_name
            
            self.updated_at = datetime.utcnow()
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    def change_password(self, current_password, new_password):
        """Change user password with current password verification"""
        if not self.check_password(current_password):
            return False, "Current password is incorrect"
        
        try:
            self.set_password(new_password)
            self.updated_at = datetime.utcnow()
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'caterer_id': self.caterer_id,
            'caterer_name': self.caterer.name if self.caterer else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<User {self.email} ({self.role})>'


class Caterer(db.Model):
    """
    Caterer model for admin users
    Stores catering business information
    """
    __tablename__ = 'caterers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    
    # Business information
    description = db.Column(db.Text)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    meals = db.relationship('Meal', backref='caterer', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, name, description=None):
        self.name = name
        self.description = description
    
    @classmethod
    def create_default_caterer(cls, name="Mama's Kitchen"):
        """Create default caterer for demo purposes"""
        caterer = cls(name=name, description="Delicious home-style meals")
        db.session.add(caterer)
        db.session.commit()
        return caterer
    
    def to_dict(self):
        """Convert caterer to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'phone': self.phone,
            'address': self.address
        }
    
    def __repr__(self):
        return f'<Caterer {self.name}>'