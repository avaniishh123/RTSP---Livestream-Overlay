# 🎥 RTSP Livestream Overlay Web Application

A professional-grade web application for streaming RTSP video feeds with real-time overlay management. Add text, images, and clickable YouTube links on top of your live video stream.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Video Streaming
- ✅ **RTSP to HLS Conversion** - Stream any RTSP source in the browser
- ✅ **Ultra-Low Latency** - 3-5 second delay with optimized FFmpeg settings
- ✅ **Audio Support** - Full audio playback with AAC encoding
- ✅ **YouTube-Like Controls** - Play, pause, seek, volume, fullscreen
- ✅ **Dual Mode Support** - OBS MediaMTX or public RTSP sources

### Overlay Management
- ✅ **Text Overlays** - Customizable text with fonts, colors, backgrounds
- ✅ **Image Overlays** - Display images with CORS/proxy support
- ✅ **YouTube Link Overlays** - Clickable links that open in new tabs
- ✅ **Drag & Resize** - Intuitive positioning and sizing
- ✅ **Real-Time Updates** - Changes appear instantly on video
- ✅ **Persistence** - Overlays saved to MongoDB or in-memory

### Professional Features
- ✅ **Fullscreen Mode** - Button and double-click support
- ✅ **LIVE Indicator** - Shows position relative to live edge
- ✅ **Buffering Indicator** - Visual feedback during loading
- ✅ **Error Recovery** - Automatic retry on network issues
- ✅ **Individual Delete** - Remove specific overlays
- ✅ **Bulk Delete** - Clear all overlays at once

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Video Player │  │   Overlays   │  │   Controls   │      │
│  │   (HLS.js)   │  │ (Drag/Resize)│  │   (CRUD UI)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                        Backend (Flask)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ HLS Serving  │  │ Overlay CRUD │  │ Image Proxy  │      │
│  │  (CORS/MIME) │  │  (MongoDB)   │  │   (CORS)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │         FFmpeg (RTSP → HLS Conversion)           │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ RTSP/TCP
┌─────────────────────────────────────────────────────────────┐
│                    RTSP Source                               │
│  • OBS Studio (via MediaMTX)                                │
│  • IP Cameras                                                │
│  • Public RTSP Streams                                       │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### Required Software
- **Python 3.8+** - Backend runtime
- **Node.js 14+** - Frontend build tool
- **FFmpeg** - Video conversion (must be in PATH)
- **MongoDB** (Optional) - Overlay persistence

### Optional Software
- **MediaMTX** - RTSP server for OBS Studio
- **OBS Studio** - For local streaming

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd Livesitter-Assignment
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment (optional)
cp .env.example .env
# Edit .env with your MongoDB URI if using MongoDB

# Start backend server
python app.py
```

Backend will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm start
```

Frontend will start on `http://localhost:3000`

### 4. Access Application
Open your browser to `http://localhost:3000`

## 🎬 Using the Application

### Option A: OBS Studio (Recommended)

1. **Install MediaMTX**
   - Download from: https://github.com/bluenviron/mediamtx/releases
   - Run MediaMTX (default port: 8554)

2. **Configure OBS Studio**
   - Install RTSP Server plugin
   - Set output to: `rtsp://localhost:8554/live/mystream`
   - Start streaming in OBS

3. **In the Application**
   - Click "📹 Use OBS Source (Recommended)"
   - Click "▶ Play Stream"
   - Video will start playing

### Option B: Public RTSP Stream

1. **In the Application**
   - Click "🌐 Use Public RTSP"
   - Enter RTSP URL (e.g., `rtsp://example.com/stream`)
   - Click "▶ Play Stream"

2. **If Stream Fails**
   - Click "🔄 Switch to OBS Source" button
   - Falls back to guaranteed working OBS mode

## 📝 Managing Overlays

### Adding Text Overlay
1. Click "📝 Text" button
2. Enter text content
3. Adjust font size, color, background
4. Click "➕ Add Overlay"
5. Drag and resize on video

### Adding Image Overlay
1. Click "🖼️ Image" button
2. Enter image URL (https://)
3. Preview will appear
4. Click "➕ Add Overlay"
5. Drag and resize on video

### Adding YouTube Link Overlay
1. Click "🔗 YouTube Link" button
2. Enter link label (e.g., "Source: YouTube")
3. Enter YouTube URL (https://youtube.com/...)
4. Adjust styling
5. Click "➕ Add Overlay"
6. Click link on video to open in new tab

### Managing Overlays
- **Drag**: Click and drag overlay to reposition
- **Resize**: Drag corner handles to resize
- **Delete Individual**: Click 🗑️ button next to overlay
- **Delete All**: Click "🗑️ Delete All" button

## 🎮 Video Controls

### Playback Controls
- **Play/Pause**: Click ▶/⏸ button or click video
- **Seek**: Click on progress bar to jump to position
- **Volume**: Adjust volume slider
- **GO LIVE**: Jump to live edge
- **Stop Stream**: Stop and reset stream

### Fullscreen
- **Button**: Click ⛶ button in controls
- **Double-Click**: Double-click video
- **Exit**: Press ESC key or click button again

### LIVE Indicator
- **🔴 LIVE** (Red): At live edge (< 3 seconds behind)
- **⚫ GO LIVE** (Gray): Behind live edge (click to catch up)

## 🔧 Configuration

### Backend Configuration

**File**: `backend/.env`
```env
# MongoDB (Optional - uses in-memory if not configured)
MONGODB_URI=mongodb://localhost:27017/rtsp_overlay

# Server Port
PORT=5000

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000
```

### Frontend Configuration

**File**: `frontend/src/App.jsx`
```javascript
// Change default OBS RTSP URL
const OBS_RTSP_URL = 'rtsp://localhost:8554/live/mystream';
```

**File**: `frontend/package.json`
```json
{
  "proxy": "http://localhost:5000"
}
```

### FFmpeg Configuration

**File**: `backend/services/rtsp_to_hls.py`

Adjust FFmpeg parameters for your needs:
```python
# Video encoding
'-preset', 'ultrafast',  # Change to 'fast' or 'medium' for better quality
'-tune', 'zerolatency',  # Keep for low latency

# HLS settings
'-hls_time', '1',        # Segment duration (1 second)
'-hls_list_size', '3',   # Number of segments to keep

# Audio encoding
'-c:a', 'aac',           # Audio codec
'-b:a', '128k',          # Audio bitrate
```

## 📚 API Documentation

### Stream Endpoints

#### Start Stream
```http
POST /api/stream/start
Content-Type: application/json

{
  "rtspUrl": "rtsp://localhost:8554/live/mystream",
  "mode": "obs"  // or "public"
}

Response:
{
  "success": true,
  "hlsUrl": "/hls/stream.m3u8",
  "mode": "obs",
  "status": "started"
}
```

#### Stop Stream
```http
POST /api/stream/stop

Response:
{
  "success": true,
  "status": "stopped"
}
```

#### Stream Status
```http
GET /api/stream/status

Response:
{
  "running": true,
  "starting": false,
  "state": "running",
  "mode": "obs",
  "rtspUrl": "rtsp://localhost:8554/live/mystream",
  "hlsReady": true,
  "lastError": null
}
```

### Overlay Endpoints

#### Create Overlay
```http
POST /api/overlays
Content-Type: application/json

// Text Overlay
{
  "type": "text",
  "content": "Hello World",
  "x": 50,
  "y": 50,
  "width": 200,
  "height": 60,
  "fontSize": "24px",
  "color": "#ffffff",
  "backgroundColor": "rgba(0, 0, 0, 0.5)"
}

// Image Overlay
{
  "type": "image",
  "content": "https://example.com/image.png",
  "x": 100,
  "y": 100,
  "width": 150,
  "height": 150
}

// YouTube Link Overlay
{
  "type": "youtube_link",
  "label": "Source: YouTube",
  "url": "https://youtube.com/watch?v=abc123",
  "x": 50,
  "y": 50,
  "width": 250,
  "height": 40,
  "fontSize": "18px",
  "color": "#ffffff",
  "backgroundColor": "rgba(0, 0, 0, 0.5)"
}

Response:
{
  "success": true,
  "overlay": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "Hello World",
    ...
  }
}
```

#### Get All Overlays
```http
GET /api/overlays

Response:
{
  "success": true,
  "overlays": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "text",
      "content": "Hello World",
      "x": 50,
      "y": 50,
      ...
    }
  ]
}
```

#### Update Overlay
```http
PUT /api/overlays/{overlay_id}
Content-Type: application/json

{
  "x": 100,
  "y": 150,
  "width": 250,
  "height": 80
}

Response:
{
  "success": true,
  "overlay": {
    "_id": "507f1f77bcf86cd799439011",
    "x": 100,
    "y": 150,
    ...
  }
}
```

#### Delete Overlay
```http
DELETE /api/overlays/{overlay_id}

Response:
{
  "success": true,
  "message": "Overlay deleted successfully"
}
```

#### Delete All Overlays
```http
DELETE /api/overlays

Response:
{
  "success": true,
  "message": "Deleted 3 overlays"
}
```

### Utility Endpoints

#### Image Proxy
```http
GET /api/image-proxy?url=https://example.com/image.png

Response: Image binary data with correct MIME type
```

#### Health Check
```http
GET /api/health

Response:
{
  "status": "healthy",
  "database": {
    "connected": true,
    "type": "mongodb"
  }
}
```

## Screenshots

<img width="769" height="890" alt="Screenshot 2026-01-15 093556" src="https://github.com/user-attachments/assets/0f26c92d-5aed-4b27-a2ed-005e6379f561" />
<img width="1350" height="870" alt="Screenshot 2026-01-15 093610" src="https://github.com/user-attachments/assets/ce500121-3805-400b-b4f0-f28a5292b052" />
<img width="1271" height="703" alt="Screenshot 2026-01-15 093658" src="https://github.com/user-attachments/assets/d4b3d9b6-d01b-49ea-9e6a-52c5e74aadc0" />
<img width="1144" height="775" alt="Screenshot 2026-01-15 093820" src="https://github.com/user-attachments/assets/cc21415b-c7f9-4282-a5ba-0c246ea91cbd" />





## 🐛 Troubleshooting

### Video Not Playing

**Issue**: Video shows buffering but doesn't play

**Solutions**:
1. Check FFmpeg is installed: `ffmpeg -version`
2. Verify RTSP URL is correct
3. Check backend logs: `backend/logs/ffmpeg.log`
4. Try OBS mode instead of public RTSP
5. Check browser console for errors

### No Audio

**Issue**: Video plays but no sound

**Solutions**:
1. Click Play button in video controls (unmutes audio)
2. Check browser tab isn't muted
3. Verify OBS audio source is enabled
4. Check system volume

### Overlays Not Saving

**Issue**: Overlays disappear after refresh

**Solutions**:
1. Check MongoDB is running (if configured)
2. Verify `.env` has correct MongoDB URI
3. Check backend logs for database errors
4. In-memory mode works but doesn't persist

### CORS Errors

**Issue**: Image overlays fail to load

**Solutions**:
1. Use image proxy (automatic fallback)
2. Use direct image URLs (not page URLs)
3. Right-click image → "Copy image address"
4. Check backend CORS configuration

### FFmpeg Errors

**Issue**: Stream fails to start

**Solutions**:
1. Verify FFmpeg is in PATH
2. Check RTSP URL is accessible
3. Try TCP transport: `-rtsp_transport tcp`
4. Check firewall settings
5. Review `backend/logs/ffmpeg.log`

## 📁 Project Structure

```
Livesitter-Assignment/
├── backend/
│   ├── routes/
│   │   └── overlays.py          # Overlay CRUD endpoints
│   ├── services/
│   │   └── rtsp_to_hls.py       # FFmpeg conversion
│   ├── logs/
│   │   └── ffmpeg.log           # FFmpeg output
│   ├── hls/
│   │   ├── stream.m3u8          # HLS playlist
│   │   └── seg_*.ts             # HLS segments
│   ├── app.py                   # Flask application
│   ├── db.py                    # Database connection
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoPlayer.jsx  # Video player component
│   │   │   ├── OverlayCanvas.jsx # Overlay rendering
│   │   │   └── OverlayControls.jsx # Overlay UI
│   │   ├── api/
│   │   │   └── overlays.js      # API client
│   │   ├── App.jsx              # Main application
│   │   └── index.js             # Entry point
│   ├── public/
│   ├── package.json             # Node dependencies
│   └── README.md                # Frontend docs
├── README.md                    # This file
└── start.bat                    # Windows startup script
```

## 🔒 Security Considerations

### HTTPS Enforcement
- YouTube links must use `https://`
- Image URLs validated before loading
- XSS protection via React sanitization

### Link Security
- `target="_blank"` for external links
- `rel="noopener noreferrer"` prevents window.opener access
- Domain validation for YouTube links

### CORS Protection
- Image proxy prevents CORS issues
- Proper CORS headers on backend
- Origin validation in production

### Input Validation
- RTSP URL format validation
- Overlay data type checking
- SQL injection prevention (MongoDB)


## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

See CONTRIBUTING.md for contribution guidelines


## 🎯 Roadmap

- [ ] WebRTC support for lower latency
- [ ] Multi-stream support
- [ ] Overlay templates
- [ ] Recording functionality
- [ ] User authentication
- [ ] Cloud deployment guides

## 📊 Performance

- **Latency**: 3-5 seconds (HLS)
- **Video Quality**: Configurable (ultrafast to slow preset)
- **Audio Quality**: AAC 128kbps
- **Overlay Updates**: Real-time (< 100ms)
- **Browser Support**: Chrome, Firefox, Edge, Safari

---

Built with ❤️from Avanish Cowkur



