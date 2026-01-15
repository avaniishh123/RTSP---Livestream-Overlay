# 📖 Complete User Guide - RTSP Livestream Overlay Application

## Table of Contents
1. [Getting Started](#getting-started)
2. [Video Streaming](#video-streaming)
3. [Overlay Management](#overlay-management)
4. [Video Controls](#video-controls)
5. [Advanced Features](#advanced-features)
6. [Tips & Best Practices](#tips--best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Setup

#### Step 1: Install Prerequisites
1. **Python 3.8+**: Download from https://python.org
2. **Node.js 14+**: Download from https://nodejs.org
3. **FFmpeg**: Download from https://ffmpeg.org
   - Windows: Add to PATH environment variable
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`

#### Step 2: Start Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Wait for message: `Running on http://127.0.0.1:5000`

#### Step 3: Start Frontend
```bash
cd frontend
npm install
npm start
```

Browser will open to `http://localhost:3000`

#### Step 4: Verify Setup
- Backend: Visit `http://localhost:5000/api/health`
- Frontend: Should see application interface
- FFmpeg: Run `ffmpeg -version` in terminal

---

## Video Streaming

### Method 1: OBS Studio (Recommended)

#### Why OBS Mode?
- ✅ Guaranteed to work
- ✅ Full control over video source
- ✅ Professional streaming features
- ✅ Low latency
- ✅ No external dependencies

#### Setup MediaMTX
1. Download MediaMTX from https://github.com/bluenviron/mediamtx/releases
2. Extract and run `mediamtx.exe` (Windows) or `./mediamtx` (Mac/Linux)
3. MediaMTX starts on port 8554

#### Configure OBS Studio
1. **Install OBS Studio**: https://obsproject.com
2. **Install RTSP Server Plugin**:
   - Download from OBS plugin repository
   - Install and restart OBS
3. **Configure RTSP Output**:
   - Open OBS Settings → Stream
   - Service: Custom
   - Server: `rtsp://localhost:8554/live/mystream`
   - Start Streaming in OBS

#### Start Streaming in Application
1. Click **"📹 Use OBS Source (Recommended)"** button
2. URL auto-fills: `rtsp://localhost:8554/live/mystream`
3. Click **"▶ Play Stream"** button
4. Wait 3-5 seconds for stream to start
5. Video appears with audio

### Method 2: Public RTSP Stream

#### When to Use Public RTSP
- Testing with public streams
- IP camera feeds
- Remote RTSP sources
- No OBS setup available

#### How to Use
1. Click **"🌐 Use Public RTSP"** button
2. Enter RTSP URL in input field
3. Example URLs:
   ```
   rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
   rtsp://your-camera-ip:554/stream
   ```
4. Click **"▶ Play Stream"** button

#### If Stream Fails
- Error message appears
- Click **"🔄 Switch to OBS Source"** button
- Automatically switches to OBS mode
- Guaranteed to work with OBS setup

### Understanding Stream Status

#### Status Messages
- **"Stream not started"**: No stream active
- **"Starting..."**: FFmpeg converting RTSP to HLS
- **"Live"**: Stream playing successfully
- **"Stream error: [reason]"**: Something went wrong

#### LIVE Indicator
- **🔴 LIVE** (Red, pulsing): At live edge (< 3 seconds behind)
- **⚫ GO LIVE** (Gray): Behind live edge (click to catch up)

---

## Overlay Management

### Text Overlays

#### Creating Text Overlay
1. Click **"📝 Text"** button in Overlay Type
2. Enter text in **"Text Content"** field
3. Adjust **Font Size** slider (12-72px)
4. Choose **Text Color** (color picker)
5. Select **Background**:
   - Semi-transparent Black (default)
   - Dark Black
   - Semi-transparent White
   - Semi-transparent Red
   - Semi-transparent Blue
   - Transparent
6. Click **"➕ Add Overlay"** button
7. Overlay appears on video at position (50, 50)

#### Text Overlay Examples
```
Breaking News: Live from New York
Score: 3-2
Temperature: 72°F
Now Playing: Song Title
```

#### Best Practices
- Keep text short and readable
- Use contrasting colors (white text on dark background)
- Avoid covering important video content
- Use semi-transparent backgrounds for better visibility

### Image Overlays

#### Creating Image Overlay
1. Click **"🖼️ Image"** button in Overlay Type
2. Enter image URL in **"Image URL"** field
3. **Getting Image URLs**:
   - Right-click image → "Copy image address"
   - Use direct image links (.png, .jpg, .gif)
   - Avoid page URLs (will use proxy)
4. Preview appears automatically
5. Click **"➕ Add Overlay"** button
6. Image appears on video

#### Supported Image Formats
- PNG (recommended for transparency)
- JPG/JPEG
- GIF (animated supported)
- WebP
- SVG
- BMP

#### Image URL Examples
```
https://example.com/logo.png
https://i.imgur.com/abc123.png
https://cdn.example.com/watermark.png
```

#### Image Proxy
- Automatically used for CORS-blocked images
- Google Images links work via proxy
- Hotlink-protected images work via proxy
- No configuration needed

#### Best Practices
- Use PNG for logos with transparency
- Optimize image size (< 500KB recommended)
- Use CDN-hosted images for reliability
- Test image URL before adding

### YouTube Link Overlays

#### Creating YouTube Link Overlay
1. Click **"🔗 YouTube Link"** button in Overlay Type
2. Enter **Link Label** (e.g., "Source: YouTube")
3. Enter **YouTube URL**:
   - Must start with `https://`
   - Must be valid YouTube URL
4. Adjust **Font Size** slider (12-48px)
5. Choose **Text Color** and **Background**
6. Click **"➕ Add Overlay"** button
7. Clickable link appears on video

#### Supported YouTube URL Formats
```
https://youtube.com/watch?v=abc123
https://www.youtube.com/watch?v=abc123
https://youtu.be/abc123
https://youtube.com/shorts/abc123
https://youtube.com/embed/abc123
```

#### URL Validation
- ⚠️ **Error**: "URL must start with https://" → Use https:// not http://
- ⚠️ **Error**: "Must be a valid YouTube URL" → Not a YouTube link
- ✅ **Success**: "Valid YouTube URL" → Ready to add

#### Link Behavior
- Click link → Opens YouTube in new tab
- Click video (not link) → Plays/pauses normally
- Drag overlay → Link moves with overlay
- Resize overlay → Link resizes

#### Best Practices
- Use descriptive labels ("Watch Full Video", "Source")
- Position links in non-intrusive areas
- Test link before finalizing
- Use contrasting colors for visibility

### Positioning & Resizing Overlays

#### Dragging Overlays
1. **Click and hold** on overlay (not on link text)
2. **Drag** to desired position
3. **Release** to drop
4. Position automatically saved

#### Resizing Overlays
1. **Hover** over overlay
2. **Corner handles** appear
3. **Click and drag** corner handle
4. **Release** to set size
5. Size automatically saved

#### Positioning Tips
- **Top-left**: Logos, watermarks
- **Top-right**: Social media links
- **Bottom-left**: Lower thirds, names
- **Bottom-right**: Timestamps, scores
- **Center**: Important announcements

#### Bounds
- Overlays stay within video area
- Cannot drag outside video bounds
- Automatic constraint to visible area

### Managing Active Overlays

#### Active Overlays List
Shows all current overlays with:
- **Type Badge**: TEXT, IMAGE, or LINK
- **Content Preview**: First 20 characters or icon
- **URL Preview**: For YouTube links (truncated)
- **Delete Button**: 🗑️ for each overlay

#### Deleting Individual Overlay
1. Find overlay in **Active Overlays** list
2. Click **🗑️** button next to overlay
3. Confirm deletion dialog appears
4. Click **OK** to delete
5. Overlay removed from video and list

#### Deleting All Overlays
1. Scroll to bottom of **Active Overlays** list
2. Click **"🗑️ Delete All"** button
3. Confirm: "Delete all overlays? This cannot be undone."
4. Click **OK** to delete all
5. All overlays removed

#### Overlay Persistence
- Overlays saved automatically
- Persist after page refresh
- Stored in MongoDB (or in-memory)
- Positions and sizes saved
- Styling preferences saved

---

## Video Controls

### Playback Controls

#### Play Button (▶)
- **Function**: Start video playback
- **Location**: Bottom-left of video
- **Shortcut**: Click video
- **Note**: Unmutes audio on first click

#### Pause Button (⏸)
- **Function**: Pause video playback
- **Location**: Bottom-left of video (replaces Play)
- **Shortcut**: Click video
- **Note**: Freezes current frame

#### Progress Bar
- **Function**: Seek to specific time
- **Location**: Top of control bar
- **Usage**: Click anywhere on bar
- **Visual**: Red fill shows current position
- **Hover**: Bar expands for easier clicking

#### Volume Control
- **Function**: Adjust audio volume
- **Location**: Next to Play/Pause button
- **Range**: 0 (mute) to 1 (max)
- **Visual**: 🔊 icon + slider
- **Note**: Volume 0 mutes video

#### Timestamp Display
- **Format**: MM:SS / MM:SS or MM:SS / LIVE
- **Location**: After volume control
- **Shows**: Current time / Total duration
- **Live Streams**: Shows "LIVE" instead of duration

### Advanced Controls

#### GO LIVE Button
- **Function**: Jump to live edge
- **Location**: Bottom-right of video
- **States**:
  - **🔴 LIVE** (Red): At live edge
  - **⚫ GO LIVE** (Gray): Behind live edge
- **Usage**: Click when behind to catch up
- **Animation**: Pulsing effect when live

#### Stop Stream Button
- **Function**: Stop and reset stream
- **Location**: Bottom-right of video
- **Icon**: ⏹ Stop
- **Effect**: 
  - Stops FFmpeg conversion
  - Clears video
  - Resets to stream selection
  - Exits fullscreen if active

#### Fullscreen Button
- **Function**: Toggle fullscreen mode
- **Location**: Bottom-right of video
- **Icon**: ⛶
- **Shortcuts**:
  - Click button
  - Double-click video
  - Press ESC to exit
- **Behavior**:
  - Video fills entire screen
  - Controls remain visible
  - Overlays remain visible
  - All functionality works

### Buffering & Loading

#### Buffering Indicator
- **Visual**: Spinning circle in center
- **Appears When**:
  - Stream starting
  - Network slow
  - Seeking
  - Recovering from error
- **Normal**: Brief buffering (1-3 seconds)
- **Issue**: Continuous buffering (check connection)

#### Error Recovery
- **Automatic**: Retries on network errors
- **Manual**: Refresh page if persistent
- **Fallback**: Switch to OBS mode if public RTSP fails

---

## Advanced Features

### Dual Mode Streaming

#### OBS Mode
- **Use Case**: Local streaming, demos, testing
- **Reliability**: Guaranteed to work
- **Setup**: Requires MediaMTX + OBS
- **Latency**: 3-5 seconds
- **Quality**: Full control via OBS

#### Public RTSP Mode
- **Use Case**: IP cameras, remote streams
- **Reliability**: Best-effort (depends on source)
- **Setup**: Just enter URL
- **Latency**: Varies by source
- **Quality**: Depends on source

#### Switching Modes
- Click mode button anytime
- URL updates automatically (OBS mode)
- Manual entry enabled (Public mode)
- No stream restart needed

### Audio Management

#### Audio Playback
- **Initial State**: Muted (browser policy)
- **Unmute**: Click Play button
- **Stays Unmuted**: After first interaction
- **Volume Control**: Slider in controls
- **Mute**: Set volume to 0

#### Audio Codec
- **Format**: AAC
- **Bitrate**: 128 kbps
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo
- **Compatibility**: All browsers

### Fullscreen Mode

#### Entering Fullscreen
1. **Button**: Click ⛶ button
2. **Double-Click**: Double-click video
3. **Keyboard**: F11 (browser fullscreen)

#### In Fullscreen
- Video fills entire screen
- Controls auto-hide after 3 seconds
- Move mouse to show controls
- All features work normally
- Overlays remain visible

#### Exiting Fullscreen
1. **Button**: Click ⛶ button again
2. **Keyboard**: Press ESC key
3. **Double-Click**: Double-click video again

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| Click Video | Play/Pause |
| Double-Click | Fullscreen |
| ESC | Exit Fullscreen |
| F11 | Browser Fullscreen |

---

## Tips & Best Practices

### Video Streaming Tips

1. **Use OBS Mode for Demos**
   - Guaranteed reliability
   - Full control over content
   - Professional quality

2. **Optimize FFmpeg Settings**
   - Lower latency: Use ultrafast preset
   - Better quality: Use fast preset
   - Balance: Use medium preset

3. **Network Considerations**
   - Wired connection recommended
   - WiFi: Use 5GHz band
   - Check bandwidth: 5+ Mbps recommended

4. **Audio Quality**
   - Enable audio in OBS
   - Check audio levels
   - Test before going live

### Overlay Design Tips

1. **Text Overlays**
   - Use readable fonts (18px+)
   - High contrast (white on black)
   - Semi-transparent backgrounds
   - Keep text short

2. **Image Overlays**
   - Use PNG for transparency
   - Optimize file size
   - Test visibility on video
   - Position strategically

3. **YouTube Links**
   - Descriptive labels
   - Non-intrusive placement
   - Contrasting colors
   - Test clickability

4. **General Layout**
   - Don't cover important content
   - Consistent positioning
   - Balanced composition
   - Test on different screens

### Performance Tips

1. **Browser**
   - Use Chrome or Edge (best performance)
   - Close unnecessary tabs
   - Disable heavy extensions
   - Clear cache if issues

2. **System**
   - Close background apps
   - Check CPU usage (< 80%)
   - Monitor memory usage
   - Restart if sluggish

3. **Network**
   - Stable connection required
   - 5+ Mbps recommended
   - Wired > WiFi
   - Check ping/latency

---

## Troubleshooting

### Video Issues

#### Video Not Playing
**Symptoms**: Buffering forever, gray screen

**Solutions**:
1. Check FFmpeg installed: `ffmpeg -version`
2. Verify RTSP URL correct
3. Check backend running: `http://localhost:5000/api/health`
4. Try OBS mode instead
5. Check browser console (F12)
6. Review backend logs: `backend/logs/ffmpeg.log`

#### No Audio
**Symptoms**: Video plays but silent

**Solutions**:
1. Click Play button (unmutes audio)
2. Check volume slider not at 0
3. Check browser tab not muted (icon)
4. Verify OBS audio enabled
5. Check system volume
6. Try different browser

#### Choppy Playback
**Symptoms**: Video stutters, freezes

**Solutions**:
1. Check network connection
2. Lower video quality in OBS
3. Close background apps
4. Try wired connection
5. Reduce overlay count
6. Clear browser cache

#### High Latency
**Symptoms**: 10+ second delay

**Solutions**:
1. Click GO LIVE button
2. Check FFmpeg settings (hls_time)
3. Reduce hls_list_size
4. Use TCP transport
5. Check network latency

### Overlay Issues

#### Overlays Not Appearing
**Symptoms**: Added but not visible

**Solutions**:
1. Check overlay within video bounds
2. Verify not behind video
3. Check opacity not 0
4. Refresh page
5. Check browser console

#### Can't Drag Overlay
**Symptoms**: Overlay won't move

**Solutions**:
1. Click overlay border (not content)
2. Don't click on link text
3. Check not in fullscreen
4. Refresh page
5. Try different browser

#### Overlays Not Saving
**Symptoms**: Disappear after refresh

**Solutions**:
1. Check MongoDB running (if configured)
2. Verify backend logs
3. Check network connection
4. In-memory mode: Expected behavior
5. Configure MongoDB for persistence

#### Image Overlay Not Loading
**Symptoms**: Shows error or blank

**Solutions**:
1. Use direct image URL
2. Right-click → "Copy image address"
3. Check URL starts with https://
4. Proxy automatically tries
5. Try different image

### Application Issues

#### Backend Won't Start
**Symptoms**: Error on `python app.py`

**Solutions**:
1. Check Python version: `python --version` (3.8+)
2. Install dependencies: `pip install -r requirements.txt`
3. Check port 5000 not in use
4. Review error message
5. Check MongoDB connection (if configured)

#### Frontend Won't Start
**Symptoms**: Error on `npm start`

**Solutions**:
1. Check Node version: `node --version` (14+)
2. Install dependencies: `npm install`
3. Check port 3000 not in use
4. Clear node_modules: `rm -rf node_modules && npm install`
5. Check package.json

#### CORS Errors
**Symptoms**: Network errors in console

**Solutions**:
1. Check backend running
2. Verify proxy in package.json
3. Check CORS configuration
4. Use image proxy (automatic)
5. Check browser console

### Getting Help

#### Before Asking for Help
1. Check this troubleshooting section
2. Review error messages
3. Check browser console (F12)
4. Review backend logs
5. Try different browser

#### Information to Provide
- Operating system
- Browser and version
- Error messages (exact text)
- Steps to reproduce
- Screenshots if applicable
- Backend logs
- Browser console logs

---

## Appendix

### Supported Browsers
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### Supported Video Formats
- Input: RTSP (any codec)
- Output: HLS (H.264 + AAC)
- Container: MPEG-TS

### Supported Image Formats
- PNG (recommended)
- JPG/JPEG
- GIF (animated)
- WebP
- SVG
- BMP

### System Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Network**: 5+ Mbps
- **Storage**: 1GB+ free space

### Default Ports
- Backend: 5000
- Frontend: 3000
- MediaMTX: 8554
- MongoDB: 27017

---

**Need more help? Check the main README.md or API documentation.**
