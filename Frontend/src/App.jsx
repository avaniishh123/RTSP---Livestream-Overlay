import React, { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import OverlayCanvas from './components/OverlayCanvas';
import OverlayControls from './components/OverlayControls';
import { getOverlays } from './api/overlays';
import './App.css';

function App() {
  const OBS_RTSP_URL = 'rtsp://localhost:8554/live/mystream';
  
  const [rtspUrl, setRtspUrl] = useState(OBS_RTSP_URL);
  const [hlsUrl, setHlsUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [overlays, setOverlays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [streamStatus, setStreamStatus] = useState('Stream not started');
  const [streamMode, setStreamMode] = useState('obs'); // 'obs' or 'public'
  const [statusPolling, setStatusPolling] = useState(null);

  // Load overlays on mount
  useEffect(() => {
    loadOverlays();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (statusPolling) {
        clearInterval(statusPolling);
      }
    };
  }, [statusPolling]);

  const loadOverlays = async () => {
    try {
      const data = await getOverlays();
      setOverlays(data);
    } catch (err) {
      console.error('Failed to load overlays:', err);
    }
  };

  const pollStreamStatus = async () => {
    try {
      const response = await fetch('/api/stream/status');
      const status = await response.json();
      
      if (status.running && status.hlsReady) {
        setStreamStatus('Live');
        setHlsUrl('http://localhost:5000/hls/stream.m3u8');
        setLoading(false);
        setIsPlaying(true);
        if (statusPolling) {
          clearInterval(statusPolling);
          setStatusPolling(null);
        }
      } else if (status.starting) {
        setStreamStatus('Starting...');
      } else if (status.lastError) {
        setStreamStatus(`Stream error: ${status.lastError}`);
        setError(status.lastError);
        setLoading(false);
        if (statusPolling) {
          clearInterval(statusPolling);
          setStatusPolling(null);
        }
      }
    } catch (err) {
      console.error('Failed to poll status:', err);
    }
  };

  const handleUseOBSSource = () => {
    setRtspUrl(OBS_RTSP_URL);
    setStreamMode('obs');
    setError('');
  };

  const handleUsePublicRTSP = () => {
    setStreamMode('public');
    setError('');
  };

  const handlePlay = async () => {
    if (!rtspUrl.trim()) {
      setError('Please enter an RTSP URL');
      return;
    }

    setLoading(true);
    setError('');
    setStreamStatus('Starting...');

    try {
      const response = await fetch('/api/stream/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rtspUrl: rtspUrl,
          mode: streamMode 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Start polling for stream status
        const interval = setInterval(pollStreamStatus, 1000);
        setStatusPolling(interval);
      } else {
        setError(data.error || 'Failed to start stream');
        setStreamStatus(`Stream error: ${data.error}`);
        setLoading(false);
        
        // If public RTSP failed, suggest OBS fallback
        if (streamMode === 'public') {
          setError(
            <div>
              <p>{data.error || 'Failed to start stream'}</p>
              <button 
                onClick={handleUseOBSSource}
                className="fallback-button"
              >
                🔄 Switch to OBS Source (Recommended)
              </button>
            </div>
          );
        }
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
      setStreamStatus('Stream error: Cannot connect to backend');
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      if (statusPolling) {
        clearInterval(statusPolling);
        setStatusPolling(null);
      }
      
      await fetch('/api/stream/stop', {
        method: 'POST',
      });
      
      setIsPlaying(false);
      setHlsUrl('');
      setStreamStatus('Stream not started');
    } catch (err) {
      console.error('Failed to stop stream:', err);
    }
  };

  const handleOverlayUpdate = () => {
    loadOverlays();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎥 RTSP Livestream Overlay</h1>
        <p>Stream RTSP video and add real-time overlays</p>
        <div className="status-indicator">
          Status: <span className={`status-${streamStatus.toLowerCase().replace(/[^a-z]/g, '')}`}>{streamStatus}</span>
        </div>
      </header>

      <div className="app-content">
        {!isPlaying ? (
          <div className="stream-setup">
            <div className="mode-toggle">
              <button
                onClick={handleUseOBSSource}
                className={`mode-button ${streamMode === 'obs' ? 'active' : ''}`}
              >
                📹 Use OBS Source (Recommended)
              </button>
              <button
                onClick={handleUsePublicRTSP}
                className={`mode-button ${streamMode === 'public' ? 'active' : ''}`}
              >
                🌐 Use Public RTSP
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="rtsp-url">RTSP Stream URL</label>
              <input
                id="rtsp-url"
                type="text"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
                placeholder="rtsp://example.com/stream"
                className="rtsp-input"
              />
              {streamMode === 'obs' && (
                <p className="mode-info">
                  ✅ OBS mode selected - URL pre-filled with MediaMTX default (editable)
                </p>
              )}
              {streamMode === 'public' && (
                <p className="mode-info">
                  ⚠️ Public RTSP mode - may fail if stream is unavailable
                </p>
              )}
              <button
                onClick={handlePlay}
                disabled={loading}
                className="play-button"
              >
                {loading ? 'Starting...' : '▶ Play Stream'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="info-box">
              <h3>📝 Instructions</h3>
              <ol>
                <li>Enter your RTSP stream URL above</li>
                <li>Click "Play Stream" to start</li>
                <li>Use the controls to add text or image overlays</li>
                <li>Drag and resize overlays on the video</li>
                <li>All changes are saved automatically</li>
              </ol>

              <h4>🧪 Test Streams</h4>
              <p>Try these RTSP streams:</p>
              <div className="test-urls">
                <code onClick={() => setRtspUrl('rtsp://localhost:8554/live')}>
                  rtsp://localhost:8554/live (OBS Studio)
                </code>
                <code onClick={() => setRtspUrl('rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4')}>
                  rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
                </code>
              </div>
            </div>
          </div>
        ) : (
          <div className="stream-container">
            <div className="video-section">
              <div className="video-wrapper">
                <VideoPlayer 
                  hlsUrl={hlsUrl} 
                  onStreamStop={handleStop}
                />
                <OverlayCanvas
                  overlays={overlays}
                  onOverlayUpdate={handleOverlayUpdate}
                />
              </div>
            </div>

            <div className="controls-section">
              <OverlayControls onOverlayUpdate={handleOverlayUpdate} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
