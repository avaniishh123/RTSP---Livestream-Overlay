import subprocess
import os
import signal
import time
import shutil
import threading
from collections import deque

class RTSPConverter:
    def __init__(self):
        self.process = None
        # Use absolute path relative to this file's directory
        self.hls_output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'hls')
        self.playlist_name = 'stream.m3u8'
        self.log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
        self.log_file = os.path.join(self.log_dir, 'ffmpeg.log')
        
        # State tracking
        self.state = 'stopped'  # stopped, starting, running, error
        self.rtsp_url = None
        self.mode = None  # 'obs' or 'public'
        self.last_error = None
        self.last_start_time = None
        self.stderr_lines = deque(maxlen=50)  # Keep last 50 lines
        
        # Ensure directories exist
        os.makedirs(self.hls_output_dir, exist_ok=True)
        os.makedirs(self.log_dir, exist_ok=True)
        
    def start_conversion(self, rtsp_url, mode='public'):
        """Start converting RTSP stream to HLS"""
        # Validate input
        if not rtsp_url or not rtsp_url.startswith('rtsp://'):
            raise ValueError("Invalid RTSP URL. Must start with 'rtsp://'")
        
        # Stop any existing conversion
        self.stop_conversion()
        
        # Update state
        self.state = 'starting'
        self.rtsp_url = rtsp_url
        self.mode = mode
        self.last_error = None
        self.last_start_time = time.time()
        self.stderr_lines.clear()
        
        # Clean up old HLS files
        self._cleanup_hls_files()
        
        # Ensure output directory exists
        os.makedirs(self.hls_output_dir, exist_ok=True)
        
        # Build FFmpeg command
        output_path = os.path.join(self.hls_output_dir, self.playlist_name)
        segment_pattern = os.path.join(self.hls_output_dir, 'seg_%03d.ts')
        
        # FFmpeg command for RTSP to HLS conversion with ULTRA-LOW latency
        # Optimized for live streaming with minimal delay and AUDIO ENABLED
        ffmpeg_cmd = [
            'ffmpeg',
            '-rtsp_transport', 'tcp',  # Use TCP for reliable streaming
            '-fflags', 'nobuffer',  # No buffering for minimal latency
            '-flags', 'low_delay',  # Low delay mode
            '-strict', 'experimental',  # Allow experimental features
            '-i', rtsp_url,
            # VIDEO encoding
            '-c:v', 'libx264',  # Encode to H.264
            '-preset', 'ultrafast',  # Fastest encoding (prioritize speed over quality)
            '-tune', 'zerolatency',  # Zero latency tuning
            '-g', '30',  # GOP size = 30 frames (1 second at 30fps)
            '-keyint_min', '30',  # Minimum keyframe interval
            '-sc_threshold', '0',  # Disable scene change detection
            # AUDIO encoding (ENABLED for browser playback)
            '-c:a', 'aac',  # Encode audio to AAC (widely supported)
            '-b:a', '128k',  # Audio bitrate
            '-ar', '44100',  # Audio sample rate
            # HLS output settings
            '-f', 'hls',
            '-hls_time', '1',  # 1 second segments
            '-hls_list_size', '3',  # Keep only last 3 segments (3 seconds total)
            '-hls_flags', 'delete_segments+append_list+independent_segments',  # Independent segments for smooth playback
            '-hls_segment_filename', segment_pattern,
            output_path
        ]
        
        try:
            # Open log file
            log_file_handle = open(self.log_file, 'w')
            
            # Start FFmpeg process
            self.process = subprocess.Popen(
                ffmpeg_cmd,
                stdout=subprocess.PIPE,
                stderr=log_file_handle,
                stdin=subprocess.PIPE,
                bufsize=1,
                universal_newlines=False
            )
            
            # Start stderr monitoring thread
            threading.Thread(target=self._monitor_stderr, daemon=True).start()
            
            # Wait for stream to initialize
            max_wait = 10  # seconds
            start_time = time.time()
            
            while time.time() - start_time < max_wait:
                # Check if process crashed
                if self.process.poll() is not None:
                    self.state = 'error'
                    self.last_error = "FFmpeg process terminated unexpectedly"
                    log_file_handle.close()
                    raise Exception(self.last_error)
                
                # Check if playlist file exists
                if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                    self.state = 'running'
                    break
                
                time.sleep(0.5)
            
            if self.state != 'running':
                self.state = 'error'
                self.last_error = "Stream failed to start within timeout period"
                self.stop_conversion()
                raise Exception(self.last_error)
            
            # Return HLS URL
            hls_url = f'/hls/{self.playlist_name}'
            return hls_url
            
        except FileNotFoundError:
            self.state = 'error'
            self.last_error = "FFmpeg not found. Please install FFmpeg and add it to your PATH."
            raise Exception(self.last_error)
        except Exception as e:
            self.state = 'error'
            self.last_error = str(e)
            self.stop_conversion()
            raise Exception(f"Failed to start stream conversion: {str(e)}")
    
    def stop_conversion(self):
        """Stop the FFmpeg conversion process"""
        if self.process and self.process.poll() is None:
            try:
                # Send quit command to FFmpeg (graceful shutdown)
                self.process.stdin.write(b'q')
                self.process.stdin.flush()
                
                # Wait for process to terminate
                self.process.wait(timeout=5)
            except:
                # Force kill if graceful shutdown fails
                try:
                    if os.name == 'nt':  # Windows
                        self.process.kill()
                    else:  # Unix-like
                        os.kill(self.process.pid, signal.SIGTERM)
                    self.process.wait(timeout=2)
                except:
                    pass
            finally:
                self.process = None
                self.state = 'stopped'
                self.rtsp_url = None
                self.mode = None
        
        # Also kill any orphaned ffmpeg processes (Windows-specific cleanup)
        if os.name == 'nt':
            try:
                subprocess.run(['taskkill', '/F', '/IM', 'ffmpeg.exe'], 
                             capture_output=True, timeout=2)
            except:
                pass
    
    def is_running(self):
        """Check if conversion is currently running"""
        if self.process is not None and self.process.poll() is None:
            return True
        elif self.process is not None:
            # Process died unexpectedly
            self.state = 'error'
            self.last_error = "FFmpeg process terminated unexpectedly"
            self.process = None
            return False
        return False
    
    def get_status(self):
        """Get detailed status information"""
        playlist_path = os.path.join(self.hls_output_dir, self.playlist_name)
        hls_ready = os.path.exists(playlist_path) and os.path.getsize(playlist_path) > 0
        
        return {
            'running': self.is_running(),
            'starting': self.state == 'starting',
            'state': self.state,
            'mode': self.mode,
            'rtspUrl': self.rtsp_url,
            'hlsReady': hls_ready,
            'lastError': self.last_error,
            'lastStartTime': self.last_start_time,
            'recentLogs': list(self.stderr_lines)
        }
    
    def _monitor_stderr(self):
        """Monitor FFmpeg stderr output in background thread"""
        try:
            with open(self.log_file, 'r') as f:
                while self.process and self.process.poll() is None:
                    line = f.readline()
                    if line:
                        self.stderr_lines.append(line.strip())
                    else:
                        time.sleep(0.1)
        except Exception as e:
            print(f"Error monitoring stderr: {e}")
    
    def _cleanup_hls_files(self):
        """Clean up old HLS files aggressively"""
        if os.path.exists(self.hls_output_dir):
            try:
                # Remove all files in the directory
                for filename in os.listdir(self.hls_output_dir):
                    file_path = os.path.join(self.hls_output_dir, filename)
                    try:
                        if os.path.isfile(file_path):
                            os.unlink(file_path)
                        elif os.path.isdir(file_path):
                            shutil.rmtree(file_path)
                    except Exception as e:
                        print(f"Warning: Could not delete {file_path}: {e}")
                        # Try force delete on Windows
                        if os.name == 'nt':
                            try:
                                os.system(f'del /F /Q "{file_path}"')
                            except:
                                pass
            except Exception as e:
                print(f"Warning: Could not clean up HLS files: {e}")
        
        # Recreate the directory to ensure it's clean
        os.makedirs(self.hls_output_dir, exist_ok=True)
