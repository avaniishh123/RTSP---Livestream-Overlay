import React, { useState, useEffect } from 'react';
import { createOverlay, getOverlays, deleteOverlay, deleteAllOverlays } from '../api/overlays';
import './OverlayControls.css';

function OverlayControls({ onOverlayUpdate }) {
  const [overlayType, setOverlayType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('Source: YouTube');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');
  const [fontSize, setFontSize] = useState('24');
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('rgba(0, 0, 0, 0.5)');
  const [overlays, setOverlays] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadOverlays();
  }, []);

  // Preview image when URL changes
  useEffect(() => {
    if (overlayType === 'image' && imageUrl.trim()) {
      validateAndPreviewImage(imageUrl);
    } else {
      setImagePreview(null);
      setImageError('');
    }
  }, [imageUrl, overlayType]);

  // Validate YouTube link when URL changes
  useEffect(() => {
    if (overlayType === 'youtube_link' && linkUrl.trim()) {
      validateYouTubeLink(linkUrl.trim());
    } else if (overlayType === 'youtube_link') {
      setLinkError('');
    }
  }, [linkUrl, overlayType]);

  const loadOverlays = async () => {
    try {
      const data = await getOverlays();
      setOverlays(data);
    } catch (err) {
      console.error('Failed to load overlays:', err);
    }
  };

  const isDirectImageUrl = (url) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp', '.ico'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

  const validateYouTubeLink = (url) => {
    // Trim spaces
    const trimmedUrl = url.trim();
    
    // Must start with https://
    if (!trimmedUrl.startsWith('https://')) {
      setLinkError('URL must start with https://');
      return false;
    }

    // Must be a YouTube link
    const youtubePatterns = [
      /^https:\/\/(www\.)?youtube\.com\/watch\?v=/,
      /^https:\/\/(www\.)?youtube\.com\/shorts\//,
      /^https:\/\/youtu\.be\//,
      /^https:\/\/(www\.)?youtube\.com\/embed\//,
      /^https:\/\/(www\.)?youtube\.com\/v\//,
    ];

    const isYouTube = youtubePatterns.some(pattern => pattern.test(trimmedUrl));
    
    if (!isYouTube) {
      setLinkError('Must be a valid YouTube URL (youtube.com or youtu.be)');
      return false;
    }

    setLinkError('');
    return true;
  };

  const normalizeYouTubeUrl = (url) => {
    // Trim spaces
    let normalized = url.trim();
    
    // Convert youtu.be short links to full URL (optional, keep original for now)
    // This is just for consistency, both formats work
    return normalized;
  };

  const validateAndPreviewImage = async (url) => {
    setIsValidating(true);
    setImageError('');
    setImagePreview(null);

    // Try direct URL first
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      setImagePreview(url);
      setImageError('');
      setIsValidating(false);
    };

    img.onerror = () => {
      // If direct URL fails, try proxy
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
      const proxyImg = new Image();
      
      proxyImg.onload = () => {
        setImagePreview(proxyUrl);
        setImageError('');
        setIsValidating(false);
      };

      proxyImg.onerror = () => {
        setImageError('Unable to load image. Please check the URL.');
        setImagePreview(null);
        setIsValidating(false);
      };

      proxyImg.src = proxyUrl;
    };

    img.src = url;
  };

  const handleAddOverlay = async () => {
    let content, overlayData;

    if (overlayType === 'text') {
      content = textContent;
      if (!content.trim()) {
        alert('Please enter text');
        return;
      }

      overlayData = {
        type: 'text',
        content: content,
        x: 50,
        y: 50,
        width: 200,
        height: 60,
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: backgroundColor,
      };
    } else if (overlayType === 'image') {
      content = imageUrl;
      if (!content.trim()) {
        alert('Please enter an image URL');
        return;
      }

      // Validate image URL
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        setImageError('Please enter a valid URL starting with http:// or https://');
        return;
      }

      // Show warning if not a direct image URL
      if (!isDirectImageUrl(imageUrl)) {
        const proceed = window.confirm(
          'This URL may not be a direct image link. The app will try to load it via proxy. Continue?'
        );
        if (!proceed) return;
      }

      overlayData = {
        type: 'image',
        content: content,
        x: 50,
        y: 50,
        width: 150,
        height: 150,
      };
    } else if (overlayType === 'youtube_link') {
      const trimmedUrl = linkUrl.trim();
      const trimmedLabel = linkLabel.trim();

      if (!trimmedLabel) {
        alert('Please enter a label for the link');
        return;
      }

      if (!trimmedUrl) {
        alert('Please enter a YouTube URL');
        return;
      }

      // Validate YouTube link
      if (!validateYouTubeLink(trimmedUrl)) {
        return; // Error already set by validateYouTubeLink
      }

      const normalizedUrl = normalizeYouTubeUrl(trimmedUrl);

      overlayData = {
        type: 'youtube_link',
        label: trimmedLabel,
        url: normalizedUrl,
        x: 50,
        y: 50,
        width: 250,
        height: 40,
        fontSize: `${fontSize}px`,
        color: textColor,
        backgroundColor: backgroundColor,
      };
    }

    try {
      await createOverlay(overlayData);

      onOverlayUpdate();
      loadOverlays();

      // Clear inputs
      if (overlayType === 'text') {
        setTextContent('');
      } else if (overlayType === 'image') {
        setImageUrl('');
        setImagePreview(null);
        setImageError('');
      } else if (overlayType === 'youtube_link') {
        setLinkLabel('Source: YouTube');
        setLinkUrl('');
        setLinkError('');
      }
    } catch (err) {
      console.error('Failed to create overlay:', err);
      alert('Failed to create overlay. Please try again.');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Delete all overlays? This cannot be undone.')) {
      try {
        await deleteAllOverlays();
        onOverlayUpdate();
        loadOverlays();
      } catch (err) {
        console.error('Failed to delete overlays:', err);
      }
    }
  };

  const handleDeleteOverlay = async (overlayId, overlayType) => {
    const overlayTypeName = overlayType === 'youtube_link' ? 'link' : overlayType;
    if (window.confirm(`Delete this ${overlayTypeName} overlay?`)) {
      try {
        await deleteOverlay(overlayId);
        onOverlayUpdate();
        loadOverlays();
      } catch (err) {
        console.error('Failed to delete overlay:', err);
        alert('Failed to delete overlay. Please try again.');
      }
    }
  };

  return (
    <div className="overlay-controls">
      <h2>Overlay Controls</h2>

      <div className="control-group">
        <label>Overlay Type</label>
        <div className="type-selector">
          <button
            className={`type-btn ${overlayType === 'text' ? 'active' : ''}`}
            onClick={() => setOverlayType('text')}
          >
            📝 Text
          </button>
          <button
            className={`type-btn ${overlayType === 'image' ? 'active' : ''}`}
            onClick={() => setOverlayType('image')}
          >
            🖼️ Image
          </button>
          <button
            className={`type-btn ${overlayType === 'youtube_link' ? 'active' : ''}`}
            onClick={() => setOverlayType('youtube_link')}
          >
            🔗 YouTube Link
          </button>
        </div>
      </div>

      {overlayType === 'text' ? (
        <>
          <div className="control-group">
            <label>Text Content</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter text..."
              rows="3"
            />
          </div>

          <div className="control-group">
            <label>Font Size: {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label>Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label>Background</label>
            <select
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            >
              <option value="rgba(0, 0, 0, 0.5)">Semi-transparent Black</option>
              <option value="rgba(0, 0, 0, 0.8)">Dark Black</option>
              <option value="rgba(255, 255, 255, 0.5)">Semi-transparent White</option>
              <option value="rgba(255, 0, 0, 0.5)">Semi-transparent Red</option>
              <option value="rgba(0, 0, 255, 0.5)">Semi-transparent Blue</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>
        </>
      ) : overlayType === 'youtube_link' ? (
        <>
          <div className="control-group">
            <label>Link Label</label>
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Source: YouTube"
            />
            <small className="helper-text">
              This text will be displayed as the clickable link
            </small>
          </div>

          <div className="control-group">
            <label>YouTube URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={linkError ? 'input-error' : ''}
            />
            <small className="helper-text">
              💡 Supported: youtube.com/watch, youtube.com/shorts, youtu.be
            </small>

            {linkError && (
              <div className="link-error-message">
                ⚠️ {linkError}
              </div>
            )}

            {!linkError && linkUrl.trim() && linkUrl.startsWith('https://') && (
              <div className="link-success-message">
                ✅ Valid YouTube URL
              </div>
            )}
          </div>

          <div className="control-group">
            <label>Font Size: {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="48"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label>Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label>Background</label>
            <select
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            >
              <option value="rgba(0, 0, 0, 0.5)">Semi-transparent Black</option>
              <option value="rgba(0, 0, 0, 0.8)">Dark Black</option>
              <option value="rgba(255, 255, 255, 0.5)">Semi-transparent White</option>
              <option value="rgba(255, 0, 0, 0.5)">Semi-transparent Red</option>
              <option value="rgba(0, 0, 255, 0.5)">Semi-transparent Blue</option>
              <option value="transparent">Transparent</option>
            </select>
          </div>
        </>
      ) : (
        <div className="control-group">
          <label>Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.png"
          />
          <small className="helper-text">
            💡 Tip: Right-click image → "Copy image address" for best results.
            <br />
            Google page links will be loaded via proxy.
          </small>

          {/* Image Preview */}
          {isValidating && (
            <div className="image-preview-container">
              <div className="preview-loading">Loading preview...</div>
            </div>
          )}

          {imagePreview && !isValidating && (
            <div className="image-preview-container">
              <div className="preview-label">Preview:</div>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="image-preview"
              />
            </div>
          )}

          {imageError && !isValidating && (
            <div className="image-error-message">
              ⚠️ {imageError}
            </div>
          )}
        </div>
      )}

      <button 
        className="add-overlay-btn" 
        onClick={handleAddOverlay}
        disabled={
          (overlayType === 'image' && isValidating) ||
          (overlayType === 'youtube_link' && (linkError || !linkUrl.trim() || !linkLabel.trim()))
        }
      >
        ➕ Add Overlay
      </button>

      <div className="overlay-list">
        <h3>Active Overlays ({overlays.length})</h3>
        {overlays.length === 0 ? (
          <p className="no-overlays">No overlays yet. Add one above!</p>
        ) : (
          <ul>
            {overlays.map((overlay) => (
              <li key={overlay._id} className="overlay-list-item">
                <div className="overlay-info">
                  <span className="overlay-type-badge">{overlay.type === 'youtube_link' ? 'link' : overlay.type}</span>
                  <span className="overlay-content-preview">
                    {overlay.type === 'text'
                      ? overlay.content.substring(0, 20)
                      : overlay.type === 'image'
                      ? '🖼️ Image'
                      : overlay.type === 'youtube_link'
                      ? `🔗 ${overlay.label || 'YouTube Link'}`
                      : 'Unknown'}
                  </span>
                  {overlay.type === 'youtube_link' && overlay.url && (
                    <small className="overlay-url-preview">
                      {overlay.url.substring(0, 30)}...
                    </small>
                  )}
                </div>
                <button
                  className="delete-overlay-item-btn"
                  onClick={() => handleDeleteOverlay(overlay._id, overlay.type)}
                  title="Delete this overlay"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
        {overlays.length > 0 && (
          <button className="delete-all-btn" onClick={handleDeleteAll}>
            🗑️ Delete All
          </button>
        )}
      </div>
    </div>
  );
}

export default OverlayControls;
