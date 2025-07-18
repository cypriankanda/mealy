#!/usr/bin/env python3
"""
Flask application entry point
Starts the catering platform backend server
"""

import os
from app import create_app

# Create Flask application instance using factory pattern
app = create_app()

# Only run dev server locally
if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))

    print("🍽️  Mealy Catering Platform Backend")
    print(f"🚀 Server starting on port {port}")
    print(f"🔧 Debug mode: {debug_mode}")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )
