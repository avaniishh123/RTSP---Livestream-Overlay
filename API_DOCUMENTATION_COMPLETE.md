# 📡 Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Table of Contents
1. [Stream Management](#stream-management)
2. [Overlay CRUD](#overlay-crud)
3. [Utility Endpoints](#utility-endpoints)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

---

## Stream Management

### Start Stream

Start RTSP to HLS conversion.

**Endpoint**: `POST /api/stream/start`

**Request Headers**:
```http
Content-Type: application/json
```

**Request Body**:
```json
{
  "rtspUrl": "rtsp://localhost:8554/live/mystream",
  "mode": "obs"
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rtspUrl | string | Yes | RTSP stream URL (must start with rtsp://) |
| mode | string | No | Stream mode: "obs" or "public" (default: "public") |

**Success Response** (200):
```json
{
  "success": true,
  "hlsUrl": "/hls/stream.m3u8",
  "mode": "obs",
  "status": "started",
  "message": "Stream started successfully"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "RTSP URL is required",
  "status": "error"
}
```

**Error Response** (500):
```json
{
  "success": false,
  "error": "FFmpeg not found. Please install FFmpeg and add it to your PATH.",
  "status": "error"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/stream/start \
  -H "Content-Type: application/json" \
  -d '{
    "rtspUrl": "rtsp://localhost:8554/live/mystream",
    "mode": "obs"
  }'
```

**JavaScript Example**:
```javascript
const response = await fetch('/api/stream/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    rtspUrl: 'rtsp://localhost:8554/live/mystream',
    mode: 'obs'
  })
});

const data = await response.json();
console.log(data.hlsUrl); // "/hls/stream.m3u8"
```

---

### Stop Stream

Stop RTSP to HLS conversion.

**Endpoint**: `POST /api/stream/stop`

**Request Headers**: None required

**Request Body**: None

**Success Response** (200):
```json
{
  "success": true,
  "status": "stopped",
  "message": "Stream stopped successfully"
}
```

**Error Response** (500):
```json
{
  "success": false,
  "error": "Failed to stop stream",
  "status": "error"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/stream/stop
```

**JavaScript Example**:
```javascript
const response = await fetch('/api/stream/stop', {
  method: 'POST'
});

const data = await response.json();
console.log(data.status); // "stopped"
```

---

### Get Stream Status

Get current stream status and details.

**Endpoint**: `GET /api/stream/status`

**Request Headers**: None required

**Request Body**: None

**Success Response** (200):
```json
{
  "running": true,
  "starting": false,
  "state": "running",
  "mode": "obs",
  "rtspUrl": "rtsp://localhost:8554/live/mystream",
  "hlsReady": true,
  "lastError": null,
  "lastStartTime": 1704067200.123,
  "recentLogs": [
    "Input #0, rtsp, from 'rtsp://localhost:8554/live/mystream':",
    "Stream #0:0: Video: h264, yuv420p, 1920x1080",
    "Stream #0:1: Audio: aac, 44100 Hz, stereo"
  ]
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| running | boolean | True if stream is currently running |
| starting | boolean | True if stream is starting up |
| state | string | Current state: "stopped", "starting", "running", "error" |
| mode | string | Stream mode: "obs" or "public" |
| rtspUrl | string | Current RTSP URL (null if stopped) |
| hlsReady | boolean | True if HLS playlist is ready |
| lastError | string | Last error message (null if no error) |
| lastStartTime | number | Unix timestamp of last start |
| recentLogs | array | Last 50 lines of FFmpeg output |

**cURL Example**:
```bash
curl http://localhost:5000/api/stream/status
```

**JavaScript Example**:
```javascript
const response = await fetch('/api/stream/status');
const status = await response.json();

if (status.running && status.hlsReady) {
  console.log('Stream is ready!');
}
```

---

## Overlay CRUD

### Create Overlay

Create a new overlay on the video.

**Endpoint**: `POST /api/overlays`

**Request Headers**:
```http
Content-Type: application/json
```

**Request Body (Text Overlay)**:
```json
{
  "type": "text",
  "content": "Hello World",
  "x": 50,
  "y": 50,
  "width": 200,
  "height": 60,
  "fontSize": "24px",
  "color": "#ffffff",
  "backgroundColor": "rgba(0, 0, 0, 0.5)",
  "opacity": 1
}
```

**Request Body (Image Overlay)**:
```json
{
  "type": "image",
  "content": "https://example.com/logo.png",
  "x": 100,
  "y": 100,
  "width": 150,
  "height": 150,
  "opacity": 1
}
```

**Request Body (YouTube Link Overlay)**:
```json
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
  "backgroundColor": "rgba(0, 0, 0, 0.5)",
  "opacity": 1
}
```

**Common Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Overlay type: "text", "image", or "youtube_link" |
| x | number | Yes | X position (pixels from left) |
| y | number | Yes | Y position (pixels from top) |
| width | number | Yes | Width in pixels |
| height | number | Yes | Height in pixels |
| opacity | number | No | Opacity (0-1, default: 1) |

**Text-Specific Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Text to display |
| fontSize | string | No | Font size (e.g., "24px") |
| color | string | No | Text color (hex or rgba) |
| backgroundColor | string | No | Background color (hex or rgba) |

**Image-Specific Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Image URL (must start with http:// or https://) |

**YouTube Link-Specific Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | Yes | Link text to display |
| url | string | Yes | YouTube URL (must be https:// and valid YouTube domain) |
| fontSize | string | No | Font size (e.g., "18px") |
| color | string | No | Text color (hex or rgba) |
| backgroundColor | string | No | Background color (hex or rgba) |

**Success Response** (201):
```json
{
  "success": true,
  "overlay": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "Hello World",
    "x": 50,
    "y": 50,
    "width": 200,
    "height": 60,
    "fontSize": "24px",
    "color": "#ffffff",
    "backgroundColor": "rgba(0, 0, 0, 0.5)",
    "opacity": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "Missing required field: content"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/overlays \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "Breaking News",
    "x": 50,
    "y": 50,
    "width": 300,
    "height": 60,
    "fontSize": "32px",
    "color": "#ff0000",
    "backgroundColor": "rgba(0, 0, 0, 0.8)"
  }'
```

**JavaScript Example**:
```javascript
const overlay = await fetch('/api/overlays', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'youtube_link',
    label: 'Watch Full Video',
    url: 'https://youtube.com/watch?v=abc123',
    x: 50,
    y: 50,
    width: 250,
    height: 40,
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  })
});

const data = await overlay.json();
console.log(data.overlay._id); // "507f1f77bcf86cd799439011"
```

---

### Get All Overlays

Retrieve all overlays.

**Endpoint**: `GET /api/overlays`

**Request Headers**: None required

**Request Body**: None

**Success Response** (200):
```json
{
  "success": true,
  "overlays": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "text",
      "content": "Hello World",
      "x": 50,
      "y": 50,
      "width": 200,
      "height": 60,
      "fontSize": "24px",
      "color": "#ffffff",
      "backgroundColor": "rgba(0, 0, 0, 0.5)",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "type": "image",
      "content": "https://example.com/logo.png",
      "x": 100,
      "y": 100,
      "width": 150,
      "height": 150,
      "created_at": "2024-01-15T10:31:00.000Z",
      "updated_at": "2024-01-15T10:31:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "type": "youtube_link",
      "label": "Source: YouTube",
      "url": "https://youtube.com/watch?v=abc123",
      "x": 50,
      "y": 50,
      "width": 250,
      "height": 40,
      "fontSize": "18px",
      "color": "#ffffff",
      "backgroundColor": "rgba(0, 0, 0, 0.5)",
      "created_at": "2024-01-15T10:32:00.000Z",
      "updated_at": "2024-01-15T10:32:00.000Z"
    }
  ]
}
```

**cURL Example**:
```bash
curl http://localhost:5000/api/overlays
```

**JavaScript Example**:
```javascript
const response = await fetch('/api/overlays');
const data = await response.json();

console.log(`Total overlays: ${data.overlays.length}`);
data.overlays.forEach(overlay => {
  console.log(`${overlay.type}: ${overlay._id}`);
});
```

---

### Get Single Overlay

Retrieve a specific overlay by ID.

**Endpoint**: `GET /api/overlays/{overlay_id}`

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| overlay_id | string | MongoDB ObjectId of the overlay |

**Success Response** (200):
```json
{
  "success": true,
  "overlay": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "Hello World",
    "x": 50,
    "y": 50,
    "width": 200,
    "height": 60,
    "fontSize": "24px",
    "color": "#ffffff",
    "backgroundColor": "rgba(0, 0, 0, 0.5)",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Overlay not found"
}
```

**cURL Example**:
```bash
curl http://localhost:5000/api/overlays/507f1f77bcf86cd799439011
```

**JavaScript Example**:
```javascript
const overlayId = '507f1f77bcf86cd799439011';
const response = await fetch(`/api/overlays/${overlayId}`);
const data = await response.json();

console.log(data.overlay.content);
```

---

### Update Overlay

Update an existing overlay's properties.

**Endpoint**: `PUT /api/overlays/{overlay_id}`

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| overlay_id | string | MongoDB ObjectId of the overlay |

**Request Headers**:
```http
Content-Type: application/json
```

**Request Body** (partial update):
```json
{
  "x": 150,
  "y": 200,
  "width": 300,
  "height": 80
}
```

**Updatable Fields**:
- `x`, `y` (position)
- `width`, `height` (size)
- `content` (text/image)
- `label`, `url` (YouTube link)
- `fontSize`, `color`, `backgroundColor` (styling)
- `opacity`

**Success Response** (200):
```json
{
  "success": true,
  "overlay": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "Hello World",
    "x": 150,
    "y": 200,
    "width": 300,
    "height": 80,
    "fontSize": "24px",
    "color": "#ffffff",
    "backgroundColor": "rgba(0, 0, 0, 0.5)",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:35:00.000Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Overlay not found"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:5000/api/overlays/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "x": 150,
    "y": 200,
    "fontSize": "32px",
    "color": "#ff0000"
  }'
```

**JavaScript Example**:
```javascript
const overlayId = '507f1f77bcf86cd799439011';
const response = await fetch(`/api/overlays/${overlayId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    x: 150,
    y: 200,
    width: 300,
    height: 80
  })
});

const data = await response.json();
console.log('Updated:', data.overlay);
```

---

### Delete Overlay

Delete a specific overlay.

**Endpoint**: `DELETE /api/overlays/{overlay_id}`

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| overlay_id | string | MongoDB ObjectId of the overlay |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Overlay deleted successfully"
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Overlay not found"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:5000/api/overlays/507f1f77bcf86cd799439011
```

**JavaScript Example**:
```javascript
const overlayId = '507f1f77bcf86cd799439011';
const response = await fetch(`/api/overlays/${overlayId}`, {
  method: 'DELETE'
});

const data = await response.json();
console.log(data.message); // "Overlay deleted successfully"
```

---

### Delete All Overlays

Delete all overlays at once.

**Endpoint**: `DELETE /api/overlays`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Deleted 3 overlays"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:5000/api/overlays
```

**JavaScript Example**:
```javascript
const response = await fetch('/api/overlays', {
  method: 'DELETE'
});

const data = await response.json();
console.log(data.message); // "Deleted 3 overlays"
```

---

## Utility Endpoints

### Image Proxy

Proxy images to avoid CORS and hotlinking issues.

**Endpoint**: `GET /api/image-proxy`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | Image URL to proxy |

**Success Response** (200):
- Content-Type: image/* (detected from source)
- Body: Image binary data

**Error Response** (400):
```json
{
  "error": "URL parameter is required"
}
```

**Error Response** (502):
```json
{
  "error": "Failed to fetch image: Connection timeout"
}
```

**cURL Example**:
```bash
curl "http://localhost:5000/api/image-proxy?url=https://example.com/image.png" \
  --output image.png
```

**JavaScript Example**:
```javascript
const imageUrl = 'https://example.com/image.png';
const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;

// Use in img tag
<img src={proxyUrl} alt="Proxied image" />
```

**HTML Example**:
```html
<img src="/api/image-proxy?url=https://example.com/image.png" alt="Logo">
```

---

### Health Check

Check backend health and database status.

**Endpoint**: `GET /api/health`

**Success Response** (200):
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "type": "mongodb"
  }
}
```

**Response (In-Memory Mode)**:
```json
{
  "status": "healthy",
  "database": {
    "connected": false,
    "type": "in-memory"
  }
}
```

**cURL Example**:
```bash
curl http://localhost:5000/api/health
```

**JavaScript Example**:
```javascript
const response = await fetch('/api/health');
const health = await response.json();

if (health.status === 'healthy') {
  console.log('Backend is healthy');
  console.log('Database:', health.database.type);
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error occurred |
| 502 | Bad Gateway | Proxy/upstream error |
| 504 | Gateway Timeout | Request timeout |

### Common Errors

#### Missing Required Field
```json
{
  "success": false,
  "error": "Missing required field: content"
}
```

#### Invalid Overlay Type
```json
{
  "success": false,
  "error": "Invalid overlay type. Must be 'text', 'image', or 'youtube_link'"
}
```

#### Overlay Not Found
```json
{
  "success": false,
  "error": "Overlay not found"
}
```

#### FFmpeg Not Found
```json
{
  "success": false,
  "error": "FFmpeg not found. Please install FFmpeg and add it to your PATH."
}
```

#### Stream Already Running
```json
{
  "success": false,
  "error": "Stream is already running"
}
```

---

## Examples

### Complete Workflow Example

```javascript
// 1. Start stream
const startResponse = await fetch('/api/stream/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rtspUrl: 'rtsp://localhost:8554/live/mystream',
    mode: 'obs'
  })
});
const startData = await startResponse.json();
console.log('Stream started:', startData.hlsUrl);

// 2. Wait for stream to be ready
let ready = false;
while (!ready) {
  const statusResponse = await fetch('/api/stream/status');
  const status = await statusResponse.json();
  ready = status.running && status.hlsReady;
  if (!ready) await new Promise(r => setTimeout(r, 1000));
}
console.log('Stream is ready!');

// 3. Add text overlay
const textOverlay = await fetch('/api/overlays', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text',
    content: 'LIVE',
    x: 20,
    y: 20,
    width: 100,
    height: 40,
    fontSize: '24px',
    color: '#ff0000',
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  })
});
const textData = await textOverlay.json();
console.log('Text overlay added:', textData.overlay._id);

// 4. Add image overlay
const imageOverlay = await fetch('/api/overlays', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'image',
    content: 'https://example.com/logo.png',
    x: 50,
    y: 50,
    width: 100,
    height: 100
  })
});
const imageData = await imageOverlay.json();
console.log('Image overlay added:', imageData.overlay._id);

// 5. Add YouTube link overlay
const linkOverlay = await fetch('/api/overlays', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'youtube_link',
    label: 'Watch Full Video',
    url: 'https://youtube.com/watch?v=abc123',
    x: 50,
    y: 500,
    width: 250,
    height: 40,
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  })
});
const linkData = await linkOverlay.json();
console.log('Link overlay added:', linkData.overlay._id);

// 6. Get all overlays
const overlaysResponse = await fetch('/api/overlays');
const overlaysData = await overlaysResponse.json();
console.log('Total overlays:', overlaysData.overlays.length);

// 7. Update overlay position
await fetch(`/api/overlays/${textData.overlay._id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    x: 100,
    y: 100
  })
});
console.log('Overlay position updated');

// 8. Delete specific overlay
await fetch(`/api/overlays/${imageData.overlay._id}`, {
  method: 'DELETE'
});
console.log('Image overlay deleted');

// 9. Stop stream
await fetch('/api/stream/stop', {
  method: 'POST'
});
console.log('Stream stopped');
```

### Python Example

```python
import requests
import time

BASE_URL = 'http://localhost:5000/api'

# Start stream
response = requests.post(f'{BASE_URL}/stream/start', json={
    'rtspUrl': 'rtsp://localhost:8554/live/mystream',
    'mode': 'obs'
})
print('Stream started:', response.json())

# Wait for stream to be ready
while True:
    status = requests.get(f'{BASE_URL}/stream/status').json()
    if status['running'] and status['hlsReady']:
        break
    time.sleep(1)
print('Stream is ready!')

# Add text overlay
overlay = requests.post(f'{BASE_URL}/overlays', json={
    'type': 'text',
    'content': 'Breaking News',
    'x': 50,
    'y': 50,
    'width': 300,
    'height': 60,
    'fontSize': '32px',
    'color': '#ff0000',
    'backgroundColor': 'rgba(0, 0, 0, 0.8)'
})
overlay_id = overlay.json()['overlay']['_id']
print('Overlay added:', overlay_id)

# Get all overlays
overlays = requests.get(f'{BASE_URL}/overlays').json()
print('Total overlays:', len(overlays['overlays']))

# Update overlay
requests.put(f'{BASE_URL}/overlays/{overlay_id}', json={
    'x': 100,
    'y': 100
})
print('Overlay updated')

# Delete overlay
requests.delete(f'{BASE_URL}/overlays/{overlay_id}')
print('Overlay deleted')

# Stop stream
requests.post(f'{BASE_URL}/stream/stop')
print('Stream stopped')
```

---

## Rate Limiting

Currently, there are no rate limits. In production, consider implementing:
- Rate limiting per IP
- Request throttling
- API key authentication

## CORS

CORS is enabled for all origins in development. In production:
- Configure specific origins in `.env`
- Use `CORS_ORIGINS=https://yourdomain.com`
- Separate multiple origins with commas

## Authentication

Currently, no authentication is required. For production:
- Implement JWT tokens
- Add API key authentication
- Use OAuth for user management

---

**For more information, see the main README.md or User Guide.**
