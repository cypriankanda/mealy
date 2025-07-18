"""
Flask application factory
Initializes the app with all extensions and blueprints
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from config import config

# Initialize Flask extensions (but don't bind to app yet)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
ma = Marshmallow()
bcrypt = Bcrypt()

def create_app(config_name=None):
    """
    Application factory function
    Creates and configures Flask app instance with all extensions
    """
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')
    
    # Create Flask application
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    
    # Configure CORS for frontend integration
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    
    # Import models (needed for migrations) - FIXED: Import actual classes
    from app.models.user import User, Caterer
    # from app.models.meal import Meal  # Uncomment if you have this
    # from app.models.order import Order  # Uncomment if you have this
    
    # Register blueprints - FIXED: Proper indentation
    from app.routes.auth_routes import auth_bp
    from app.routes.customer_routes import customer_bp  
    from app.routes.admin_routes import admin_bp
    
    # Register blueprints with URL prefixes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(customer_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Root route for the home page
    @app.route('/')
    def home():
        return {
            'message': '🍽️ Welcome to Mealy Catering Platform API',
            'status': 'success',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'authentication': '/api/auth/*',
                'customer_api': '/api/*',
                'admin_api': '/api/admin/*'
            },
            'documentation': 'Visit /api/docs for API documentation'
        }
    
    # API documentation endpoint
    @app.route('/api/docs')
    def api_docs():
        return {
            'api_name': 'Mealy Catering Platform API',
            'version': '1.0.0',
            'endpoints': {
                'Authentication': {
                    'POST /api/auth/register': 'Register new user',
                    'POST /api/auth/login': 'Login user',
                    'POST /api/auth/logout': 'Logout user',
                    'GET /api/auth/profile': 'Get user profile'
                },
                'Customer': {
                    'GET /api/meals': 'Get all meals',
                    'GET /api/meals/<id>': 'Get specific meal',
                    'POST /api/orders': 'Create new order',
                    'GET /api/orders': 'Get user orders'
                },
                'Admin': {
                    'GET /api/admin/users': 'Get all users',
                    'GET /api/admin/orders': 'Get all orders',
                    'POST /api/admin/meals': 'Create new meal',
                    'PUT /api/admin/meals/<id>': 'Update meal',
                    'DELETE /api/admin/meals/<id>': 'Delete meal'
                }
            }
        }
    
    # Global error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return {'error': 'Bad request', 'message': str(error)}, 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return {'error': 'Unauthorized', 'message': 'Authentication required'}, 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return {'error': 'Forbidden', 'message': 'Insufficient permissions'}, 403
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found', 'message': 'Resource not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error', 'message': 'Something went wrong'}, 500
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Mealy API is running'}
    
    return app