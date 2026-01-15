# RTSP Livestream Overlay - Backend

Flask-based backend server for RTSP stream conversion and overlay management.

## Features

- RTSP to HLS stream conversion using FFmpeg
- RESTful API for overlay CRUD operations
- MongoDB data persistence
- CORS-enabled for frontend integration

## Prerequisites

- Python 3.8+
- MongoDB (local or Atlas)
- FFmpeg installed and in PATH

### Installing FFmpeg

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract and add to PATH
3. Verify: `ffmpeg -version`

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file from example:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/rtsp_overlay_app
PORT=5000
FLASK_ENV=development
```

For MongoDB Atlas, use connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rtsp_overlay_app
```

### 3. Start MongoDB (if running locally)

```bash
mongod
```

### 4. Run the Server

```bash
python app.py
```

Server will start on `http://localhost:5000`

## API Documentation

### Stream Endpoints

#### Start Stream
```http
POST /api/stream/start
Content-Type: application/json

{
  "rtsp_url": "rtsp://example.com/stream"
}
```

**Response:**
```json
{
  "success": true,
  "hls_url": "/hls/stream.m3u8",
  "message": "Stream started successfully"
}
```

#### Stop Stream
```http
POST /api/stream/stop
```

**Response:**
```json
{
  "success": true,
  "message": "Stream stopped successfully"
}
```

#### Stream Status
```http
GET /api/stream/status
```

**Response:**
```json
{
  "is_running": true
}
```

### Overlay Endpoints

#### Create Overlay
```http
POST /api/overlays
Content-Type: application/json

{
  "type": "text",
  "content": "Hello World",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 50,
  "fontSize": "24px",
  "color": "#ffffff",
  "backgroundColor": "rgba(0,0,0,0.5)"
}
```

**Response:**
```json
{
  "success": true,
  "overlay": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "Hello World",
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 50,
    "fontSize": "24px",
    "color": "#ffffff",
    "backgroundColor": "rgba(0,0,0,0.5)",
    "created_at": "2024-01-14T10:30:00.000Z",
    "updated_at": "2024-01-14T10:30:00.000Z"
  }
}
```

#### Get All Overlays
```http
GET /api/overlays
```

**Response:**
```json
{
  "success": true,
  "overlays": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "text",
      "content": "Hello World",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 50,
      "created_at": "2024-01-14T10:30:00.000Z",
      "updated_at": "2024-01-14T10:30:00.000Z"
    }
  ]
}
```

#### Get Single Overlay
```http
GET /api/overlays/:id
```

**Response:**
```json
{
  "success": true,
  "overlay": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "Hello World",
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 50
  }
}
```

#### Update Overlay
```http
PUT /api/overlays/:id
Content-Type: application/json

{
  "x": 150,
  "y": 150,
  "content": "Updated Text"
}
```

**Response:**
```json
{
  "success": true,
  "overlay": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "Updated Text",
    "x": 150,
    "y": 150,
    "width": 200,
    "height": 50,
    "updated_at": "2024-01-14T10:35:00.000Z"
  }
}
```

#### Delete Overlay
```http
DELETE /api/overlays/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Overlay deleted successfully"
}
```

#### Delete All Overlays
```http
DELETE /api/overlays
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 5 overlays"
}
```

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy"
}
```

## RTSP to HLS Conversion

The backend uses FFmpeg to convert RTSP streams to HLS format:

1. **RTSP Input**: Accepts any valid RTSP URL
2. **FFmpeg Processing**: Converts stream to HLS with 2-second segments
3. **HLS Output**: Generates `.m3u8` playlist and `.ts` segments
4. **Browser Playback**: Frontend plays HLS using hls.js

### Conversion Parameters

- Transport: TCP (more reliable than UDP)
- Video Codec: Copy (no re-encoding for low latency)
- Audio Codec: AAC
- Segment Duration: 2 seconds
- Playlist Size: 5 segments (rolling window)

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── db.py                  # MongoDB connection setup
├── routes/
│   └── overlays.py        # Overlay CRUD endpoints
├── services/
│   └── rtsp_to_hls.py     # RTSP to HLS conversion service
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Troubleshooting

### FFmpeg Not Found
```
Error: FFmpeg not found. Please install FFmpeg and add it to your PATH.
```
**Solution**: Install FFmpeg and ensure it's in your system PATH.

### MongoDB Connection Error
```
Error: Failed to connect to MongoDB
```
**Solution**: 
- Check MongoDB is running: `mongod`
- Verify MONGODB_URI in `.env`
- For Atlas, check network access and credentials

### RTSP Stream Fails
```
Error: FFmpeg failed to start
```
**Solution**:
- Verify RTSP URL is valid and accessible
- Check network connectivity
- Try different RTSP transport (TCP/UDP)
- Check FFmpeg logs for detailed error

### Port Already in Use
```
Error: Address already in use
```
**Solution**: Change PORT in `.env` or kill process using port 5000.

## Testing with Sample RTSP Streams

Public test streams:
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

Note: Public RTSP streams may be unreliable. For production, use your own RTSP source.

## Development

### Running in Debug Mode
```bash
FLASK_ENV=development python app.py
```

### Viewing Logs
FFmpeg output is captured in the subprocess. Check console for errors.

## Production Considerations

- Use production WSGI server (Gunicorn, uWSGI)
- Enable HTTPS
- Implement authentication
- Add rate limiting
- Monitor FFmpeg processes
- Implement stream health checks
- Add logging and monitoring
