from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS
from dotenv import load_dotenv
import os
import mimetypes
import requests
from io import BytesIO
from db import init_db, get_db_status
from routes.overlays import overlays_bp
from services.rtsp_to_hls import RTSPConverter

load_dotenv()

app = Flask(__name__)
CORS(app)

# HLS directory setup
HLS_DIR = os.path.join(os.path.dirname(__file__), "hls")
os.makedirs(HLS_DIR, exist_ok=True)

# Initialize database with fallback
db_available = init_db(app)

# Register blueprints
app.register_blueprint(overlays_bp, url_prefix='/api')

# RTSP converter instance
rtsp_converter = RTSPConverter()

@app.route('/api/stream/start', methods=['POST'])
def start_stream():
    """Start RTSP to HLS conversion"""
    data = request.json
    rtsp_url = data.get('rtspUrl') or data.get('rtsp_url')  # Support both formats
    mode = data.get('mode', 'public')  # 'obs' or 'public'
    
    if not rtsp_url:
        return jsonify({'success': False, 'error': 'RTSP URL is required'}), 400
    
    try:
        hls_url = rtsp_converter.start_conversion(rtsp_url, mode)
        return jsonify({
            'success': True,
            'hlsUrl': hls_url,
            'mode': mode,
            'status': 'started',
            'message': 'Stream started successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'status': 'error'}), 500

@app.route('/api/stream/stop', methods=['POST'])
def stop_stream():
    """Stop RTSP to HLS conversion"""
    try:
        rtsp_converter.stop_conversion()
        return jsonify({
            'success': True,
            'status': 'stopped',
            'message': 'Stream stopped successfully'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'status': 'error'}), 500

@app.route('/api/stream/status', methods=['GET'])
def stream_status():
    """Get detailed stream status"""
    status = rtsp_converter.get_status()
    return jsonify(status)

@app.route("/hls/<path:filename>")
def hls_files(filename):
    """Serve HLS files with correct MIME types and cache headers"""
    try:
        # Security: Prevent directory traversal
        if '..' in filename or filename.startswith('/'):
            return jsonify({'error': 'Invalid filename', 'message': 'Directory traversal not allowed'}), 400
        
        # Set correct MIME types
        if filename.endswith('.m3u8'):
            mimetype = 'application/vnd.apple.mpegurl'
            cache_control = 'no-store, no-cache, must-revalidate'  # No cache for playlist
        elif filename.endswith('.ts'):
            mimetype = 'video/mp2t'
            cache_control = 'public, max-age=3'  # Short cache for segments (3 seconds)
        else:
            return jsonify({'error': 'Invalid file type', 'message': 'Only .m3u8 and .ts files are allowed'}), 400
        
        response = send_from_directory(HLS_DIR, filename, mimetype=mimetype)
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        # Add cache headers
        response.headers['Cache-Control'] = cache_control
        if filename.endswith('.m3u8'):
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        
        return response
    except FileNotFoundError:
        return jsonify({
            'error': 'File not found',
            'message': f'HLS file "{filename}" not found. Make sure the stream is running.',
            'hint': 'Start the stream first using POST /api/stream/start'
        }), 404
    except Exception as e:
        return jsonify({
            'error': 'Server error',
            'message': str(e)
        }), 500

@app.route('/api/image-proxy', methods=['GET'])
def image_proxy():
    """Proxy images to avoid CORS and hotlinking issues"""
    image_url = request.args.get('url')
    
    if not image_url:
        return jsonify({'error': 'URL parameter is required'}), 400
    
    try:
        # Fetch the image with proper headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
        }
        
        response = requests.get(image_url, headers=headers, timeout=10, stream=True)
        response.raise_for_status()
        
        # Get content type
        content_type = response.headers.get('Content-Type', 'image/jpeg')
        
        # If it's not an image, try to detect from URL
        if not content_type.startswith('image/'):
            # Try to guess from URL extension
            if image_url.lower().endswith('.png'):
                content_type = 'image/png'
            elif image_url.lower().endswith('.jpg') or image_url.lower().endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif image_url.lower().endswith('.gif'):
                content_type = 'image/gif'
            elif image_url.lower().endswith('.webp'):
                content_type = 'image/webp'
            elif image_url.lower().endswith('.svg'):
                content_type = 'image/svg+xml'
            else:
                content_type = 'image/jpeg'  # Default fallback
        
        # Read image data
        image_data = BytesIO(response.content)
        
        # Create response
        from flask import send_file
        return send_file(
            image_data,
            mimetype=content_type,
            as_attachment=False,
            download_name='image'
        )
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Image request timed out'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch image: {str(e)}'}), 502
    except Exception as e:
        return jsonify({'error': f'Proxy error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint with database status"""
    db_status = get_db_status()
    return jsonify({
        'status': 'healthy',
        'database': db_status
    })

if __name__ == '__main__':
    print("=" * 60)
    print("RTSP Livestream Overlay Backend")
    print("=" * 60)
    print(f"Database: {'Connected' if db_available else 'Using in-memory fallback'}")
    print(f"HLS Directory: {HLS_DIR}")
    print("=" * 60)
    
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
