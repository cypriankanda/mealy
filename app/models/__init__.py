"""
Models package initialization
Imports all model classes for easy access
"""

from .user import User, Caterer
from .meal import Meal, DailyMenu, DailyMenuMeal  
from .order import Order

__all__ = ['User', 'Caterer', 'Meal', 'DailyMenu', 'DailyMenuMeal', 'Order']