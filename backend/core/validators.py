"""
Input validation utilities for Flask API endpoints.
Protects against injection attacks and malformed data.
"""

import re
from functools import wraps
from flask import request, jsonify
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


class Validator:
    """Input validation utilities"""
    
    @staticmethod
    def validate_string(value: Any, min_length: int = 1, max_length: int = 255, 
                       pattern: Optional[str] = None, field_name: str = "field") -> str:
        """Validate string input"""
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be a string")
        
        value = value.strip()
        
        if len(value) < min_length:
            raise ValidationError(f"{field_name} must be at least {min_length} characters")
        
        if len(value) > max_length:
            raise ValidationError(f"{field_name} must not exceed {max_length} characters")
        
        if pattern and not re.match(pattern, value):
            raise ValidationError(f"{field_name} has invalid format")
        
        return value
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return Validator.validate_string(
            email, 
            min_length=5, 
            max_length=255,
            pattern=email_pattern,
            field_name="email"
        )
    
    @staticmethod
    def validate_username(username: str) -> str:
        """Validate username format"""
        username_pattern = r'^[a-zA-Z0-9_-]{3,50}$'
        return Validator.validate_string(
            username,
            min_length=3,
            max_length=50,
            pattern=username_pattern,
            field_name="username"
        )
    
    @staticmethod
    def validate_password(password: str) -> str:
        """Validate password strength"""
        if not isinstance(password, str):
            raise ValidationError("Password must be a string")
        
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters")
        
        if len(password) > 128:
            raise ValidationError("Password must not exceed 128 characters")
        
        # Check for at least one uppercase, one lowercase, and one digit
        if not re.search(r'[A-Z]', password):
            raise ValidationError("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', password):
            raise ValidationError("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', password):
            raise ValidationError("Password must contain at least one digit")
        
        return password
    
    @staticmethod
    def validate_number(value: Any, min_value: Optional[float] = None, 
                       max_value: Optional[float] = None, field_name: str = "field") -> float:
        """Validate numeric input"""
        try:
            value = float(value)
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be a number")
        
        if min_value is not None and value < min_value:
            raise ValidationError(f"{field_name} must be at least {min_value}")
        
        if max_value is not None and value > max_value:
            raise ValidationError(f"{field_name} must not exceed {max_value}")
        
        return value
    
    @staticmethod
    def validate_integer(value: Any, min_value: Optional[int] = None,
                        max_value: Optional[int] = None, field_name: str = "field") -> int:
        """Validate integer input"""
        try:
            value = int(value)
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be an integer")
        
        if min_value is not None and value < min_value:
            raise ValidationError(f"{field_name} must be at least {min_value}")
        
        if max_value is not None and value > max_value:
            raise ValidationError(f"{field_name} must not exceed {max_value}")
        
        return value
    
    @staticmethod
    def validate_enum(value: Any, allowed_values: List[Any], field_name: str = "field") -> Any:
        """Validate enum/choice input"""
        if value not in allowed_values:
            raise ValidationError(
                f"{field_name} must be one of: {', '.join(str(v) for v in allowed_values)}"
            )
        return value
    
    @staticmethod
    def validate_boolean(value: Any, field_name: str = "field") -> bool:
        """Validate boolean input"""
        if isinstance(value, bool):
            return value
        
        if isinstance(value, str):
            value_lower = value.lower()
            if value_lower in ('true', '1', 'yes', 'on'):
                return True
            if value_lower in ('false', '0', 'no', 'off'):
                return False
        
        raise ValidationError(f"{field_name} must be a boolean")


def validate_request(schema: Dict[str, Dict[str, Any]], location: str = 'json'):
    """
    Decorator to validate request data against a schema.
    
    Args:
        schema: Dictionary defining validation rules
        location: Where to get data from ('json', 'args', 'form')
        
    Example:
        @app.route("/api/user", methods=["POST"])
        @validate_request({
            'username': {'type': 'username', 'required': True},
            'email': {'type': 'email', 'required': True},
            'age': {'type': 'integer', 'min': 0, 'max': 150}
        })
        def create_user():
            data = request.get_json()
            return {"message": "User created"}
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get data based on location
            if location == 'json':
                data = request.get_json(silent=True) or {}
            elif location == 'args':
                data = request.args.to_dict()
            elif location == 'form':
                data = request.form.to_dict()
            else:
                return jsonify({"error": "Invalid validation location"}), 500
            
            errors = {}
            
            # Validate each field
            for field_name, rules in schema.items():
                value = data.get(field_name)
                
                # Check required fields
                if rules.get('required', False) and value is None:
                    errors[field_name] = f"{field_name} is required"
                    continue
                
                # Skip validation if field is optional and not provided
                if value is None:
                    continue
                
                try:
                    # Validate based on type
                    field_type = rules.get('type', 'string')
                    
                    if field_type == 'string':
                        Validator.validate_string(
                            value,
                            min_length=rules.get('min', 1),
                            max_length=rules.get('max', 255),
                            pattern=rules.get('pattern'),
                            field_name=field_name
                        )
                    elif field_type == 'email':
                        Validator.validate_email(value)
                    elif field_type == 'username':
                        Validator.validate_username(value)
                    elif field_type == 'password':
                        Validator.validate_password(value)
                    elif field_type == 'number':
                        Validator.validate_number(
                            value,
                            min_value=rules.get('min'),
                            max_value=rules.get('max'),
                            field_name=field_name
                        )
                    elif field_type == 'integer':
                        Validator.validate_integer(
                            value,
                            min_value=rules.get('min'),
                            max_value=rules.get('max'),
                            field_name=field_name
                        )
                    elif field_type == 'enum':
                        Validator.validate_enum(
                            value,
                            rules.get('allowed', []),
                            field_name=field_name
                        )
                    elif field_type == 'boolean':
                        Validator.validate_boolean(value, field_name=field_name)
                    
                except ValidationError as e:
                    errors[field_name] = str(e)
            
            # Return errors if any
            if errors:
                logger.warning(f"Validation failed for {request.path}: {errors}")
                return jsonify({"error": "Validation failed", "details": errors}), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

