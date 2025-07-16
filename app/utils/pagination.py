"""
Pagination utilities for consistent API responses
Provides helper functions for paginated results
"""

from flask import request

def paginate_query(query, page=None, per_page=None, max_per_page=100):
    """
    Paginate a SQLAlchemy query
    Returns pagination object with items and metadata
    """
    if page is None:
        page = request.args.get('page', 1, type=int)
    
    if per_page is None:
        per_page = request.args.get('per_page', 10, type=int)
    
    # Enforce maximum page size
    per_page = min(per_page, max_per_page)
    
    # Ensure minimum values
    page = max(page, 1)
    per_page = max(per_page, 1)
    
    return query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )

def create_pagination_response(pagination, schema):
    """
    Create standardized pagination response
    Returns dictionary with data and pagination metadata
    """
    return {
        'data': schema.dump(pagination.items),
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_prev': pagination.has_prev,
            'has_next': pagination.has_next,
            'prev_num': pagination.prev_num,
            'next_num': pagination.next_num
        }
    }

def get_pagination_params():
    """
    Extract pagination parameters from request
    Returns (page, per_page) tuple with defaults
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Validate and set limits
    page = max(page, 1)
    per_page = max(min(per_page, 100), 1)  # Between 1 and 100
    
    return page, per_page