from flask_pymongo import PyMongo
import os

mongo = PyMongo()
db_available = False

def init_db(app):
    """Initialize MongoDB connection with fallback"""
    global db_available
    
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/rtsp_overlay_app')
    
    # Try MongoDB Atlas first
    try:
        app.config['MONGO_URI'] = mongodb_uri
        app.config['MONGO_CONNECT_TIMEOUT_MS'] = 5000
        app.config['MONGO_SERVER_SELECTION_TIMEOUT_MS'] = 5000
        
        mongo.init_app(app)
        
        # Test connection
        mongo.db.command('ping')
        
        # Create indexes
        mongo.db.overlays.create_index('created_at')
        
        db_available = True
        print("✓ MongoDB connected successfully")
        print(f"  Database: {mongo.db.name}")
        return True
        
    except Exception as e:
        print(f"⚠ MongoDB Atlas connection failed: {e}")
        
        # Try local MongoDB as fallback
        try:
            print("  Attempting local MongoDB connection...")
            app.config['MONGO_URI'] = 'mongodb://localhost:27017/rtsp_overlay_app'
            mongo.init_app(app)
            mongo.db.command('ping')
            mongo.db.overlays.create_index('created_at')
            
            db_available = True
            print("✓ Connected to local MongoDB")
            return True
            
        except Exception as local_error:
            db_available = False
            print(f"⚠ Local MongoDB also unavailable: {local_error}")
            print("⚠ Using in-memory overlays (data will not persist)")
            return False

def get_db():
    """Get database instance"""
    if db_available:
        return mongo.db
    return None

def get_db_status():
    """Get database connection status"""
    return {
        'connected': db_available,
        'type': 'MongoDB' if db_available else 'In-Memory'
    }
