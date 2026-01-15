import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';

function VideoPlayer({ hlsUrl, onStreamStop }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const checkLiveIntervalRef = useRef(null);
  const containerRef = useRef(null);
  const isSeekingRef = useRef(false); // Track if user is actively seeking

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if we're at the live edge (only when not seeking)
  const checkIfLive = useCallback(() => {
    if (isSeekingRef.current) return; // Don't check during seek
    
    const video = videoRef.current;
    if (!video || !video.duration || !isFinite(video.duration)) {
      setIsLive(true);
      return;
    }
    
    const timeBehindLive = video.duration - video.currentTime;
    setIsLive(timeBehindLive < 3); // Within 3 seconds of live edge
  }, []);

  // Initialize HLS
  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      // Initialize HLS.js with optimized configuration
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 4,
        maxBufferLength: 10,  // Increased for smoother playback
        maxMaxBufferLength: 20,
        maxBufferSize: 20 * 1000 * 1000,
        maxBufferHole: 0.5,
        maxLiveSyncPlaybackRate: 1.5,
        enableWorker: true,
        backBufferLength: 0,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 10000,
        // Additional smoothness settings
        maxLoadingDelay: 4,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferLength: 30,
      });

      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Only auto-play if user initiated (first load)
        if (shouldAutoPlay) {
          video.muted = true;
          video.play().then(() => {
            setIsPlaying(true);
            setShouldAutoPlay(false);
          }).catch(err => {
            console.log('Autoplay prevented:', err);
            setIsPlaying(false);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              setIsBuffering(true);
              hls.startLoad();
              setTimeout(() => setIsBuffering(false), 2000);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              setIsBuffering(true);
              hls.recoverMediaError();
              setTimeout(() => setIsBuffering(false), 2000);
              break;
            default:
              console.log('Fatal error, cannot recover');
              hls.destroy();
              setIsPlaying(false);
              break;
          }
        }
      });

      // Handle buffering events
      hls.on(Hls.Events.FRAG_LOADING, () => {
        setIsBuffering(true);
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setIsBuffering(false);
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
      video.muted = true;
      if (shouldAutoPlay) {
        video.addEventListener('loadedmetadata', () => {
          video.play().then(() => {
            setIsPlaying(true);
            setShouldAutoPlay(false);
          }).catch(err => {
            console.log('Autoplay prevented:', err);
            setIsPlaying(false);
          });
        });
      }
    }

    // Start checking live status
    checkLiveIntervalRef.current = setInterval(checkIfLive, 1000);

    return () => {
      if (checkLiveIntervalRef.current) {
        clearInterval(checkLiveIntervalRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, shouldAutoPlay, checkIfLive]);

  // Handle Play button
  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Unmute audio on user interaction (browser policy compliance)
    video.muted = false;
    
    video.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.error('Play failed:', err);
    });
  }, []);

  // Handle Pause button
  const handlePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);
  }, []);

  // Handle Go Live button
  const handleGoLive = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Unmute audio on user interaction
    video.muted = false;

    isSeekingRef.current = true; // Mark as seeking
    
    // Jump to live edge
    if (video.duration && isFinite(video.duration)) {
      video.currentTime = video.duration - 0.5;
    } else {
      // For infinite live streams, try to seek to end
      video.currentTime = video.seekable.length > 0 ? video.seekable.end(0) - 0.5 : video.currentTime;
    }
    
    // Resume playback
    video.play().then(() => {
      setIsPlaying(true);
      setIsLive(true);
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 500);
    }).catch(err => {
      console.error('Go live failed:', err);
      isSeekingRef.current = false;
    });
  }, []);

  // Handle Stop Stream button
  const handleStopStream = useCallback(() => {
    const video = videoRef.current;
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    // Pause video
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.src = '';
    }

    // Destroy HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Clear live check interval
    if (checkLiveIntervalRef.current) {
      clearInterval(checkLiveIntervalRef.current);
    }

    setIsPlaying(false);
    setIsLive(true);
    setCurrentTime(0);
    setDuration(0);

    // Call parent callback to stop backend stream
    if (onStreamStop) {
      onStreamStop();
    }
  }, [onStreamStop]);

  // Handle Fullscreen toggle
  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Exit fullscreen failed:', err);
      });
    }
  }, []);

  // Handle double-click to toggle fullscreen
  const handleDoubleClick = useCallback(() => {
    handleFullscreen();
  }, [handleFullscreen]);

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  }, []);

  // Handle seek (click on progress bar)
  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    isSeekingRef.current = true; // Mark as seeking
    const seekTime = parseFloat(e.target.value);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
    
    // Clear seeking flag after a short delay
    setTimeout(() => {
      isSeekingRef.current = false;
    }, 500);
  }, []);

  // Listen to video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (!isSeekingRef.current) { // Only update if not seeking
        setCurrentTime(video.currentTime);
        setDuration(video.duration || 0);
      }
    };
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleSeeking = () => {
      setIsBuffering(true);
      isSeekingRef.current = true;
    };
    const handleSeeked = () => {
      setIsBuffering(false);
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 100);
    };

    video.addEventListener('play', handlePlayEvent);
    video.addEventListener('pause', handlePauseEvent);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('play', handlePlayEvent);
      video.removeEventListener('pause', handlePauseEvent);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      className="video-player" 
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
    >
      <video
        ref={videoRef}
        className="video-element"
        playsInline
      />
      
      {isBuffering && (
        <div className="buffering-indicator">
          <div className="spinner"></div>
        </div>
      )}

      <div className="video-controls-overlay">
        {/* Progress Bar */}
        <div className="progress-container">
          <input
            type="range"
            className="progress-bar"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            step="0.1"
          />
          <div 
            className="progress-filled"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Control Bar */}
        <div className="control-bar">
          <div className="control-left">
            {/* Play/Pause Button */}
            {!isPlaying ? (
              <button 
                className="control-btn play-btn" 
                onClick={handlePlay}
                title="Play"
              >
                ▶
              </button>
            ) : (
              <button 
                className="control-btn pause-btn" 
                onClick={handlePause}
                title="Pause"
              >
                ⏸
              </button>
            )}

            {/* Volume Control */}
            <div className="volume-control">
              <span className="volume-icon">🔊</span>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>

            {/* Timestamp */}
            <div className="timestamp">
              {formatTime(currentTime)} / {duration && isFinite(duration) ? formatTime(duration) : 'LIVE'}
            </div>
          </div>

          <div className="control-right">
            {/* LIVE Button */}
            <button 
              className={`control-btn live-btn ${isLive ? 'live-active' : 'live-inactive'}`}
              onClick={handleGoLive}
              title={isLive ? 'At live edge' : 'Go to live edge'}
            >
              {isLive ? '🔴 LIVE' : '⚫ GO LIVE'}
            </button>

            {/* Fullscreen Button */}
            <button 
              className="control-btn fullscreen-btn" 
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>

            {/* Stop Stream Button */}
            <button 
              className="control-btn stop-btn" 
              onClick={handleStopStream}
              title="Stop stream"
            >
              ⏹ Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
