"""
Digital Twin Gas Turbine Dashboard - Backend Server
Flask application with SocketIO for real-time communication
"""

from flask import Flask, request, jsonify, session
from flask_socketio import SocketIO, emit, disconnect
from flask_cors import CORS
import jwt
import os
from datetime import datetime, timedelta
import random
import time
from functools import wraps

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Enable CORS
CORS(app, 
     origins=["http://localhost:5178", "http://localhost:5179", "http://localhost:5180"],
     supports_credentials=True)

# Initialize SocketIO
socketio = SocketIO(app, 
                   cors_allowed_origins=["http://localhost:5178", "http://localhost:5179", "http://localhost:5180"],
                   async_mode='threading')

# Mock users database
USERS = {
    'admin': {'password': 'admin123', 'role': 'admin', 'id': 1},
    'engineer': {'password': 'admin123', 'role': 'engineer', 'id': 2},
    'operator': {'password': 'admin123', 'role': 'operator', 'id': 3},
}

# Store CSRF tokens (in production, use Redis or database)
csrf_tokens = {}

# JWT token verification decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'message': 'Token is missing'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = data['user']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# CSRF token verification
def verify_csrf_token():
    if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
        csrf_token = request.headers.get('X-CSRF-Token')
        if not csrf_token or csrf_token not in csrf_tokens.values():
            return jsonify({'message': 'Invalid CSRF token'}), 403
    return None

# ==================== Authentication Routes ====================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400
    
    user = USERS.get(username)
    if not user or user['password'] != password:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Generate JWT token
    token = jwt.encode({
        'user': username,
        'role': user['role'],
        'id': user['id'],
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    # Generate CSRF token
    import secrets
    csrf_token = secrets.token_hex(32)
    csrf_tokens[username] = csrf_token
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'username': username,
            'role': user['role']
        },
        'csrf_token': csrf_token
    }), 200

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout(current_user):
    """User logout endpoint"""
    # Remove CSRF token
    if current_user['username'] in csrf_tokens:
        del csrf_tokens[current_user['username']]
    
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    role = data.get('role', 'viewer')
    
    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400
    
    if username in USERS:
        return jsonify({'message': 'Username already exists'}), 400
    
    # Add new user (in production, save to database)
    USERS[username] = {
        'password': password,
        'role': role,
        'id': len(USERS) + 1
    }
    
    return jsonify({'message': 'User registered successfully'}), 201

# ==================== RTM (Real-Time Monitoring) Routes ====================

@app.route('/api/rtm/historical', methods=['GET'])
@token_required
def get_historical_data(current_user):
    """Get historical RTM data"""
    time_range = request.args.get('range', '1h')
    
    # Generate mock historical data
    data = []
    now = datetime.now()
    points = 100 if time_range == '1h' else 500
    
    for i in range(points):
        timestamp = now - timedelta(seconds=i * 2)
        data.append({
            'time': timestamp.isoformat(),
            'time_id': f'T{i+1}',
            'Pressure_In': round(1.2 + random.uniform(-0.1, 0.1), 2),
            'Pressure_Out': round(8.5 + random.uniform(-0.5, 0.5), 2),
            'Flow_Rate': round(45 + random.uniform(-5, 5), 2),
            'Temperature_In': round(420 + random.uniform(-20, 20), 1),
            'Temperature_Out': round(720 + random.uniform(-30, 30), 1),
            'Efficiency': round(0.85 + random.uniform(-0.05, 0.05), 3),
            'Vibration': round(12 + random.uniform(-3, 3), 2),
        })
    
    return jsonify({'data': data}), 200

# ==================== RTO (Real-Time Optimization) Routes ====================

@app.route('/api/rto/history', methods=['GET'])
@token_required
def get_rto_history(current_user):
    """Get RTO efficiency history"""
    data = []
    now = datetime.now()
    
    for i in range(24):
        timestamp = now - timedelta(hours=23-i)
        data.append({
            'time': timestamp.isoformat(),
            'efficiency': round(85 + random.uniform(-3, 5), 2),
        })
    
    return jsonify({'data': data}), 200

@app.route('/api/rto/suggestion', methods=['GET'])
@token_required
def get_rto_suggestion(current_user):
    """Get RTO optimization suggestion"""
    suggestions = [
        "Increase compressor pressure ratio by 2% to improve efficiency",
        "Reduce turbine inlet temperature by 5°C to extend component life",
        "Optimize fuel flow rate for current load conditions",
        "Adjust IGV position to improve compressor performance",
    ]
    
    return jsonify({
        'suggestion_text': random.choice(suggestions),
        'timestamp': datetime.now().isoformat(),
    }), 200

# ==================== PdM (Predictive Maintenance) Routes ====================

@app.route('/api/pdm/predictions', methods=['GET'])
@token_required
def get_pdm_predictions(current_user):
    """Get predictive maintenance predictions"""
    components = ['Bearing', 'Blade', 'Liner', 'Seal', 'Valve']
    
    predictions = []
    for component in components:
        predictions.append({
            'component': component,
            'rul': round(random.uniform(100, 1000), 1),  # Remaining Useful Life in hours
            'health_score': round(random.uniform(0.7, 0.95), 2),
            'maintenance_date': (datetime.now() + timedelta(days=random.randint(30, 180))).isoformat(),
        })
    
    return jsonify({'data': predictions}), 200

# ==================== WebSocket Events ====================

@socketio.on('connect')
def handle_connect(auth=None):
    """Handle WebSocket connection"""
    try:
        # Get token from auth or query string
        token = None
        if auth:
            token = auth.get('token')
        elif request.args.get('token'):
            token = request.args.get('token')
        
        # Get session ID for this connection
        client_sid = request.sid
        
        # Allow connection without token for testing (can be removed in production)
        if not token:
            print(f'⚠️ WebSocket: No token provided, allowing connection for testing (sid: {client_sid})')
            emit('connected', {'message': 'Connected (no auth)', 'user': 'guest'})
            import threading
            thread = threading.Thread(target=lambda: start_real_time_data('guest', client_sid), daemon=True)
            thread.start()
            return True
        
        # Verify token if provided
        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            username = data['user']
            print(f'✅ WebSocket connected: {username} (sid: {client_sid})')
            
            # Store connection info
            session['username'] = username
            session['user_id'] = data['id']
            
            emit('connected', {'message': 'Connected successfully', 'user': username})
            
            # Start sending real-time data in background
            import threading
            thread = threading.Thread(target=lambda: start_real_time_data(username, client_sid), daemon=True)
            thread.start()
            
        except jwt.ExpiredSignatureError:
            print(f'❌ WebSocket: Token expired, allowing connection for testing (sid: {client_sid})')
            emit('connected', {'message': 'Connected (expired token)', 'user': 'guest'})
            import threading
            thread = threading.Thread(target=lambda: start_real_time_data('guest', client_sid), daemon=True)
            thread.start()
            return True
        except jwt.InvalidTokenError:
            print(f'❌ WebSocket: Invalid token, allowing connection for testing (sid: {client_sid})')
            emit('connected', {'message': 'Connected (invalid token)', 'user': 'guest'})
            import threading
            thread = threading.Thread(target=lambda: start_real_time_data('guest', client_sid), daemon=True)
            thread.start()
            return True
            
    except Exception as e:
        print(f'❌ WebSocket connection error: {e}')
        print('⚠️ Allowing connection for testing')
        client_sid = request.sid if hasattr(request, 'sid') else None
        emit('connected', {'message': 'Connected (error)', 'user': 'guest'})
        if client_sid:
            import threading
            thread = threading.Thread(target=lambda: start_real_time_data('guest', client_sid), daemon=True)
            thread.start()
        return True

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    username = session.get('username', 'Unknown')
    print(f'❌ WebSocket disconnected: {username}')

def start_real_time_data(username, client_sid=None):
    """Start sending real-time data to connected client"""
    def send_data():
        while True:
            try:
                # Generate real-time data point
                data_point = {
                    'Time': datetime.now().isoformat(),
                    'Timestamp': datetime.now().isoformat(),
                    'Pressure_In': round(1.2 + random.uniform(-0.1, 0.1), 2),
                    'Pressure_Out': round(8.5 + random.uniform(-0.5, 0.5), 2),
                    'Flow_Rate': round(45 + random.uniform(-5, 5), 2),
                    'Temperature_In': round(420 + random.uniform(-20, 20), 1),
                    'Temperature_Out': round(720 + random.uniform(-30, 30), 1),
                    'Efficiency': round(0.85 + random.uniform(-0.05, 0.05), 3),
                    'Vibration': round(12 + random.uniform(-3, 3), 2),
                    'Power_Consumption': round(850 + random.uniform(-50, 50), 1),
                }
                
                # Emit to specific client or all clients
                if client_sid:
                    socketio.emit('new_data', data_point, room=client_sid)
                else:
                    socketio.emit('new_data', data_point)
                
                # Occasionally send alerts
                if random.random() < 0.1:  # 10% chance
                    alerts = [
                        'High vibration detected in compressor stage 2',
                        'Temperature exceeding normal range',
                        'Pressure drop detected in filter system',
                    ]
                    alert = {
                        'timestamp': datetime.now().isoformat(),
                        'details': random.choice(alerts),
                        'severity': random.choice(['Critical', 'Warning', 'Info']),
                    }
                    if client_sid:
                        socketio.emit('new_alert', alert, room=client_sid)
                    else:
                        socketio.emit('new_alert', alert)
                
                # Occasionally send RTO suggestions
                if random.random() < 0.05:  # 5% chance
                    suggestion = {
                        'suggestion_text': 'Optimize fuel flow rate for current load conditions',
                        'timestamp': datetime.now().isoformat(),
                    }
                    if client_sid:
                        socketio.emit('new_rto_suggestion', suggestion, room=client_sid)
                    else:
                        socketio.emit('new_rto_suggestion', suggestion)
                
                time.sleep(2)  # Send data every 2 seconds
                
            except Exception as e:
                print(f'Error sending real-time data: {e}')
                import traceback
                traceback.print_exc()
                break
    
    # Start data thread
    import threading
    thread = threading.Thread(target=send_data, daemon=True)
    thread.start()

# ==================== Health Check ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    }), 200

# ==================== Main ====================

if __name__ == '__main__':
    print('🚀 Starting Digital Twin Gas Turbine Backend Server...')
    print('📡 Server running on http://localhost:5000')
    print('🔌 WebSocket enabled')
    print('')
    
    socketio.run(app, 
                host='0.0.0.0',
                port=5000,
                debug=True,
                allow_unsafe_werkzeug=True)

