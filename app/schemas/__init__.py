"""
Marshmallow schemas for request/response validation
Provides data serialization and validation for API endpoints
"""

from marshmallow import Schema, fields, validate, validates, ValidationError
from app.models import User, Meal, Order

# Base schemas for common patterns
class PaginationSchema(Schema):
    """Schema for pagination parameters"""
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=10, validate=validate.Range(min=1, max=100))

# Authentication schemas
class RegisterSchema(Schema):
    """Schema for user registration"""
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))
    role = fields.String(required=True, validate=validate.OneOf(['customer', 'admin']))
    caterer_id = fields.Integer(allow_none=True)

class LoginSchema(Schema):
    """Schema for user login"""
    email = fields.Email(required=True)
    password = fields.String(required=True)

# User profile schemas
class ProfileUpdateSchema(Schema):
    """Schema for updating user profile"""
    email = fields.Email()
    current_password = fields.String()
    new_password = fields.String(validate=validate.Length(min=6))
    caterer_name = fields.String()

class UserSchema(Schema):
    """Schema for user data serialization"""
    id = fields.Integer(dump_only=True)
    email = fields.Email()
    role = fields.String()
    caterer_id = fields.Integer(allow_none=True)
    caterer_name = fields.String(allow_none=True)
    created_at = fields.DateTime(dump_only=True)

# Meal schemas
class MealCreateSchema(Schema):
    """Schema for creating meals"""
    name = fields.String(required=True, validate=validate.Length(min=1, max=120))
    description = fields.String(required=True, validate=validate.Length(min=1))
    price = fields.Float(required=True, validate=validate.Range(min=0.01))

class MealUpdateSchema(Schema):
    """Schema for updating meals"""
    name = fields.String(validate=validate.Length(min=1, max=120))
    description = fields.String(validate=validate.Length(min=1))
    price = fields.Float(validate=validate.Range(min=0.01))

class MealSchema(Schema):
    """Schema for meal data serialization"""
    id = fields.Integer(dump_only=True)
    name = fields.String()
    description = fields.String()
    price = fields.Float()
    caterer_id = fields.Integer()
    is_active = fields.Boolean()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

# Order schemas
class OrderCreateSchema(Schema):
    """Schema for creating orders"""
    meal_id = fields.Integer(required=True)
    special_instructions = fields.String(allow_none=True, validate=validate.Length(max=500))

class OrderUpdateStatusSchema(Schema):
    """Schema for updating order status"""
    status = fields.String(required=True, validate=validate.OneOf([
        'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
    ]))

class OrderSchema(Schema):
    """Schema for order data serialization"""
    order_id = fields.Integer(attribute='id')
    user_id = fields.Integer()
    meal_id = fields.Integer()
    meal_name = fields.String()
    price = fields.Float()
    menu_date = fields.Date()
    status = fields.String()
    special_instructions = fields.String()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

class OrderHistorySchema(Schema):
    """Schema for order history serialization"""
    order_id = fields.Integer(attribute='id')
    meal_name = fields.String()
    price = fields.Float()
    menu_date = fields.Date()
    status = fields.String()
    created_at = fields.DateTime()

class AdminOrderSchema(Schema):
    """Schema for admin order view"""
    order_id = fields.Integer(attribute='id')
    customer_email = fields.String()
    meal_name = fields.String()
    price = fields.Float()
    menu_date = fields.Date()
    status = fields.String()
    special_instructions = fields.String()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

# Menu schemas
class DailyMenuCreateSchema(Schema):
    """Schema for creating daily menu"""
    date = fields.Date(required=True)
    meal_ids = fields.List(fields.Integer(), required=True, validate=validate.Length(min=1))

class MenuSchema(Schema):
    """Schema for menu data serialization"""
    date = fields.Date()
    meals = fields.List(fields.Nested(MealSchema))

# Filter schemas
class OrderFilterSchema(Schema):
    """Schema for order filtering parameters"""
    status = fields.String(validate=validate.OneOf([
        'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
    ]))
    date = fields.Date()
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))

# Dashboard schemas  
class DashboardStatsSchema(Schema):
    """Schema for dashboard statistics"""
    total_orders = fields.Integer()
    confirmed_orders = fields.Integer()
    total_revenue = fields.Float()
    status_counts = fields.Dict()

# Response schemas
class MessageResponseSchema(Schema):
    """Schema for simple message responses"""
    message = fields.String()

class ErrorResponseSchema(Schema):
    """Schema for error responses"""
    error = fields.String()
    message = fields.String()

class TokenResponseSchema(Schema):
    """Schema for authentication token responses"""
    access_token = fields.String()
    user = fields.Nested(UserSchema)

# Initialize schema instances
user_schema = UserSchema()
users_schema = UserSchema(many=True)

meal_schema = MealSchema()
meals_schema = MealSchema(many=True)

order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)

order_history_schema = OrderHistorySchema()
order_history_list_schema = OrderHistorySchema(many=True)

admin_order_schema = AdminOrderSchema()
admin_orders_schema = AdminOrderSchema(many=True)

menu_schema = MenuSchema()

register_schema = RegisterSchema()
login_schema = LoginSchema()
profile_update_schema = ProfileUpdateSchema()

meal_create_schema = MealCreateSchema()
meal_update_schema = MealUpdateSchema()

order_create_schema = OrderCreateSchema()
order_update_status_schema = OrderUpdateStatusSchema()

daily_menu_create_schema = DailyMenuCreateSchema()
order_filter_schema = OrderFilterSchema()
dashboard_stats_schema = DashboardStatsSchema()

message_response_schema = MessageResponseSchema()
error_response_schema = ErrorResponseSchema()
token_response_schema = TokenResponseSchema()