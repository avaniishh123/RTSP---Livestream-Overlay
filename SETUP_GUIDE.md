# 🚀 Setup Guide - RTSP Livestream Overlay Application

## Quick Setup (5 Minutes)

### Prerequisites Check
```bash
# Check Python
python --version  # Should be 3.8+

# Check Node.js
node --version    # Should be 14+

# Check FFmpeg
ffmpeg -version   # Should show FFmpeg version
```

If any are missing, install them first (see [Detailed Setup](#detailed-setup) below).

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

✅ Backend running on `http://localhost:5000`

### 2. Frontend Setup
```bash
# Open new terminal
cd frontend
npm install
npm start
```

✅ Frontend running on `http://localhost:3000`

### 3. Test Application
1. Open browser to `http://localhost:3000`
2. Click "Use OBS Source"
3. Click "Play Stream"
4. If you have OBS + MediaMTX running, video will play!

---

## Detailed Setup

### Windows Setup

#### 1. Install Python
1. Download from https://python.org/downloads
2. Run installer
3. ✅ Check "Add Python to PATH"
4. Click "Install Now"
5. Verify: `python --version`

#### 2. Install Node.js
1. Download from https://nodejs.org
2. Run installer (LTS version recommended)
3. Accept defaults
4. Verify: `node --version` and `npm --version`

#### 3. Install FFmpeg
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add to PATH:
   - Search "Environment Variables"
   - Edit "Path" variable
   - Add `C:\ffmpeg\bin`
   - Click OK
4. Restart terminal
5. Verify: `ffmpeg -version`

#### 4. Install MongoDB (Optional)
1. Download from https://mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Install as Windows Service
5. Verify: `mongod --version`

#### 5. Install MediaMTX (For OBS Mode)
1. Download from https://github.com/bluenviron/mediamtx/releases
2. Extract to folder
3. Run `mediamtx.exe`
4. Runs on port 8554

#### 6. Install OBS Studio (For OBS Mode)
1. Download from https://obsproject.com
2. Run installer
3. Install RTSP Server plugin
4. Configure output to `rtsp://localhost:8554/live/mystream`

### macOS Setup

#### 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Prerequisites
```bash
# Python
brew install python@3.11

# Node.js
brew install node

# FFmpeg
brew install ffmpeg

# MongoDB (optional)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### 3. Install MediaMTX
```bash
# Download and extract
curl -L https://github.com/bluenviron/mediamtx/releases/latest/download/mediamtx_*_darwin_amd64.tar.gz -o mediamtx.tar.gz
tar -xzf mediamtx.tar.gz
./mediamtx
```

#### 4. Install OBS Studio
```bash
brew install --cask obs
# Install RTSP Server plugin manually
```

### Linux Setup (Ubuntu/Debian)

#### 1. Install Prerequisites
```bash
# Update package list
sudo apt update

# Python
sudo apt install python3 python3-pip

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# FFmpeg
sudo apt install ffmpeg

# MongoDB (optional)
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### 2. Install MediaMTX
```bash
# Download and extract
wget https://github.com/bluenviron/mediamtx/releases/latest/download/mediamtx_*_linux_amd64.tar.gz
tar -xzf mediamtx_*_linux_amd64.tar.gz
./mediamtx
```

#### 3. Install OBS Studio
```bash
sudo add-apt-repository ppa:obsproject/obs-studio
sudo apt update
sudo apt install obs-studio
```

---

## Configuration

### Backend Configuration

#### Create .env file
```bash
cd backend
cp .env.example .env
```

#### Edit .env
```env
# MongoDB (optional - uses in-memory if not set)
MONGODB_URI=mongodb://localhost:27017/rtsp_overlay

# Server port
PORT=5000

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:3000

# Flask environment
FLASK_ENV=development
```

### Frontend Configuration

#### Proxy Configuration
File: `frontend/package.json`
```json
{
  "proxy": "http://localhost:5000"
}
```

#### OBS URL Configuration
File: `frontend/src/App.jsx`
```javascript
const OBS_RTSP_URL = 'rtsp://localhost:8554/live/mystream';
```

### FFmpeg Configuration

File: `backend/services/rtsp_to_hls.py`

#### For Lower Latency
```python
'-hls_time', '1',        # 1 second segments
'-hls_list_size', '3',   # Keep 3 segments
'-preset', 'ultrafast',  # Fastest encoding
```

#### For Better Quality
```python
'-hls_time', '2',        # 2 second segments
'-hls_list_size', '6',   # Keep 6 segments
'-preset', 'fast',       # Better quality
```

---

## Verification

### 1. Check Backend
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "type": "mongodb"
  }
}
```

### 2. Check Frontend
Open browser to `http://localhost:3000`

Should see:
- Application interface
- Overlay Controls panel
- Stream setup area

### 3. Check FFmpeg
```bash
ffmpeg -version
```

Should show FFmpeg version and configuration.

### 4. Check MediaMTX (if using OBS mode)
```bash
curl http://localhost:8554
```

Should return MediaMTX info or 404 (both are fine).

### 5. Check MongoDB (if configured)
```bash
mongosh
```

Should connect to MongoDB shell.

---

## Troubleshooting Setup

### Python Issues

#### "python: command not found"
- Windows: Reinstall Python with "Add to PATH" checked
- Mac/Linux: Use `python3` instead of `python`

#### "pip: command not found"
- Windows: Reinstall Python
- Mac/Linux: `sudo apt install python3-pip` or `brew install python`

#### "Permission denied" on pip install
- Use `pip install --user -r requirements.txt`
- Or use virtual environment (recommended)

### Node.js Issues

#### "npm: command not found"
- Reinstall Node.js
- Check PATH includes Node.js bin directory

#### "EACCES: permission denied"
- Mac/Linux: Use `sudo npm install -g npm`
- Or fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

#### Port 3000 already in use
- Kill process: `lsof -ti:3000 | xargs kill` (Mac/Linux)
- Or use different port: `PORT=3001 npm start`

### FFmpeg Issues

#### "ffmpeg: command not found"
- Windows: Add FFmpeg to PATH
- Mac: `brew install ffmpeg`
- Linux: `sudo apt install ffmpeg`

#### "FFmpeg not found" error in application
- Verify FFmpeg in PATH: `ffmpeg -version`
- Restart terminal after adding to PATH
- Restart backend after fixing PATH

### MongoDB Issues

#### "Connection refused"
- Start MongoDB: `sudo systemctl start mongodb` (Linux)
- Or: `brew services start mongodb-community` (Mac)
- Or: Start MongoDB service (Windows)

#### "Authentication failed"
- Check MONGODB_URI in .env
- Verify MongoDB credentials
- Or use in-memory mode (remove MONGODB_URI)

### MediaMTX Issues

#### "Connection refused" on port 8554
- Start MediaMTX: `./mediamtx`
- Check port not in use: `lsof -i:8554` (Mac/Linux)
- Check firewall settings

#### OBS can't connect to MediaMTX
- Verify MediaMTX running
- Check URL: `rtsp://localhost:8554/live/mystream`
- Check RTSP Server plugin installed in OBS

---

## Development Setup

### Using Virtual Environment (Recommended)

#### Create Virtual Environment
```bash
cd backend
python -m venv venv
```

#### Activate Virtual Environment
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Deactivate
```bash
deactivate
```

### Using Docker (Advanced)

#### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/rtsp_overlay
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## Production Setup

### Backend Production

#### Install Production Server
```bash
pip install gunicorn
```

#### Run with Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Systemd Service (Linux)
File: `/etc/systemd/system/rtsp-backend.service`
```ini
[Unit]
Description=RTSP Overlay Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable rtsp-backend
sudo systemctl start rtsp-backend
```

### Frontend Production

#### Build for Production
```bash
cd frontend
npm run build
```

#### Serve with Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /hls {
        proxy_pass http://localhost:5000;
        add_header Cache-Control no-cache;
    }
}
```

---

## Next Steps

After setup is complete:

1. **Read User Guide**: `USER_GUIDE_COMPLETE.md`
2. **Check API Docs**: `API_DOCUMENTATION_COMPLETE.md`
3. **Test Application**: Follow Quick Start in README.md
4. **Configure OBS**: Set up MediaMTX and OBS Studio
5. **Add Overlays**: Try text, image, and link overlays

---

## Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Review error messages carefully
3. Check browser console (F12)
4. Check backend logs
5. Verify all prerequisites installed
6. Try restarting services

---

**Setup complete! Ready to stream with overlays! 🎉**
