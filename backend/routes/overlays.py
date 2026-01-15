from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from db import get_db
import uuid

overlays_bp = Blueprint('overlays', __name__)

# In-memory fallback storage
in_memory_overlays = []

def serialize_overlay(overlay):
    """Convert MongoDB document to JSON-serializable dict"""
    if '_id' in overlay:
        overlay['_id'] = str(overlay['_id'])
    return overlay

def use_memory_storage():
    """Check if we should use in-memory storage"""
    return get_db() is None

@overlays_bp.route('/overlays', methods=['POST'])
def create_overlay():
    """Create a new overlay"""
    try:
        data = request.json
        
        # Validate required fields based on type
        if data['type'] == 'youtube_link':
            # YouTube link requires label and url instead of content
            if 'label' not in data or 'url' not in data:
                return jsonify({'success': False, 'error': 'YouTube link requires "label" and "url" fields'}), 400
            required_fields = ['type', 'label', 'url', 'x', 'y', 'width', 'height']
        else:
            # Text and image require content
            required_fields = ['type', 'content', 'x', 'y', 'width', 'height']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        # Validate overlay type
        if data['type'] not in ['text', 'image', 'youtube_link']:
            return jsonify({'success': False, 'error': 'Invalid overlay type. Must be "text", "image", or "youtube_link"'}), 400
        
        # Create overlay document
        overlay = {
            'type': data['type'],
            'x': float(data['x']),
            'y': float(data['y']),
            'width': float(data['width']),
            'height': float(data['height']),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Type-specific fields
        if data['type'] == 'youtube_link':
            overlay['label'] = data['label']
            overlay['url'] = data['url']
        else:
            overlay['content'] = data['content']
        
        # Optional fields
        if 'fontSize' in data:
            overlay['fontSize'] = data['fontSize']
        if 'color' in data:
            overlay['color'] = data['color']
        if 'backgroundColor' in data:
            overlay['backgroundColor'] = data['backgroundColor']
        if 'opacity' in data:
            overlay['opacity'] = float(data['opacity'])
        
        # Use MongoDB or in-memory storage
        if use_memory_storage():
            overlay['_id'] = str(uuid.uuid4())
            in_memory_overlays.append(overlay)
        else:
            db = get_db()
            result = db.overlays.insert_one(overlay)
            overlay['_id'] = str(result.inserted_id)
        
        return jsonify({
            'success': True,
            'overlay': overlay
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@overlays_bp.route('/overlays', methods=['GET'])
def get_overlays():
    """Get all overlays"""
    try:
        if use_memory_storage():
            overlays = in_memory_overlays.copy()
        else:
            db = get_db()
            overlays = list(db.overlays.find().sort('created_at', 1))
            overlays = [serialize_overlay(overlay) for overlay in overlays]
        
        return jsonify({
            'success': True,
            'overlays': overlays
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@overlays_bp.route('/overlays/<overlay_id>', methods=['GET'])
def get_overlay(overlay_id):
    """Get a single overlay by ID"""
    try:
        if use_memory_storage():
            overlay = next((o for o in in_memory_overlays if o['_id'] == overlay_id), None)
            if not overlay:
                return jsonify({'success': False, 'error': 'Overlay not found'}), 404
        else:
            db = get_db()
            overlay = db.overlays.find_one({'_id': ObjectId(overlay_id)})
            if not overlay:
                return jsonify({'success': False, 'error': 'Overlay not found'}), 404
            overlay = serialize_overlay(overlay)
        
        return jsonify({
            'success': True,
            'overlay': overlay
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@overlays_bp.route('/overlays/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    """Update an existing overlay"""
    try:
        data = request.json
        
        if use_memory_storage():
            overlay = next((o for o in in_memory_overlays if o['_id'] == overlay_id), None)
            if not overlay:
                return jsonify({'success': False, 'error': 'Overlay not found'}), 404
            
            # Update fields
            allowed_fields = ['type', 'content', 'label', 'url', 'x', 'y', 'width', 'height', 'fontSize', 'color', 'backgroundColor', 'opacity']
            for field in allowed_fields:
                if field in data:
                    if field in ['x', 'y', 'width', 'height', 'opacity']:
                        overlay[field] = float(data[field])
                    else:
                        overlay[field] = data[field]
            overlay['updated_at'] = datetime.utcnow()
            
        else:
            db = get_db()
            overlay = db.overlays.find_one({'_id': ObjectId(overlay_id)})
            if not overlay:
                return jsonify({'success': False, 'error': 'Overlay not found'}), 404
            
            # Build update document
            update_data = {'updated_at': datetime.utcnow()}
            allowed_fields = ['type', 'content', 'label', 'url', 'x', 'y', 'width', 'height', 'fontSize', 'color', 'backgroundColor', 'opacity']
            for field in allowed_fields:
                if field in data:
                    if field in ['x', 'y', 'width', 'height', 'opacity']:
                        update_data[field] = float(data[field])
                    else:
                        update_data[field] = data[field]
            
            # Update overlay
            db.overlays.update_one(
                {'_id': ObjectId(overlay_id)},
                {'$set': update_data}
            )
            
            # Get updated overlay
            overlay = db.overlays.find_one({'_id': ObjectId(overlay_id)})
            overlay = serialize_overlay(overlay)
        
        return jsonify({
            'success': True,
            'overlay': overlay
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@overlays_bp.route('/overlays/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    """Delete an overlay"""
    try:
        if use_memory_storage():
            overlay = next((o for o in in_memory_overlays if o['_id'] == overlay_id), None)
            if not overlay:
                return jsonify({'success': False, 'error': 'Overlay not found'}), 404
            in_memory_overlays.remove(overlay)
        else:
            db = get_db()
            overlay = db.overlays.find_one({'_id': ObjectId(overlay_id)})
            if not overlay:
                return jsonify({'success': False, 'error': 'Overlay not found'}), 404
            db.overlays.delete_one({'_id': ObjectId(overlay_id)})
        
        return jsonify({
            'success': True,
            'message': 'Overlay deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@overlays_bp.route('/overlays', methods=['DELETE'])
def delete_all_overlays():
    """Delete all overlays"""
    try:
        if use_memory_storage():
            count = len(in_memory_overlays)
            in_memory_overlays.clear()
        else:
            db = get_db()
            result = db.overlays.delete_many({})
            count = result.deleted_count
        
        return jsonify({
            'success': True,
            'message': f'Deleted {count} overlays'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
