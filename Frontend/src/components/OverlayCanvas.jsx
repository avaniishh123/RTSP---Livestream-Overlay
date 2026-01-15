import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { updateOverlay, deleteOverlay } from '../api/overlays';
import './OverlayCanvas.css';

function OverlayCanvas({ overlays, onOverlayUpdate }) {
  const [imageErrors, setImageErrors] = useState({});

  const handleDragStop = async (overlay, d) => {
    try {
      await updateOverlay(overlay._id, {
        x: d.x,
        y: d.y,
      });
      onOverlayUpdate();
    } catch (err) {
      console.error('Failed to update overlay position:', err);
    }
  };

  const handleResizeStop = async (overlay, ref, position) => {
    try {
      await updateOverlay(overlay._id, {
        width: parseInt(ref.style.width),
        height: parseInt(ref.style.height),
        x: position.x,
        y: position.y,
      });
      onOverlayUpdate();
    } catch (err) {
      console.error('Failed to update overlay size:', err);
    }
  };

  const handleDelete = async (overlayId) => {
    if (window.confirm('Delete this overlay?')) {
      try {
        await deleteOverlay(overlayId);
        onOverlayUpdate();
      } catch (err) {
        console.error('Failed to delete overlay:', err);
      }
    }
  };

  const handleImageError = (overlayId, originalUrl) => {
    console.error('Image failed to load:', originalUrl);
    // Try using proxy
    setImageErrors(prev => ({ ...prev, [overlayId]: true }));
  };

  const getImageUrl = (overlay) => {
    // If direct URL failed, use proxy
    if (imageErrors[overlay._id]) {
      return `/api/image-proxy?url=${encodeURIComponent(overlay.content)}`;
    }
    return overlay.content;
  };

  return (
    <div className="overlay-canvas">
      {overlays.map((overlay) => (
        <Rnd
          key={overlay._id}
          default={{
            x: overlay.x,
            y: overlay.y,
            width: overlay.width,
            height: overlay.height,
          }}

          position={{ x: overlay.x, y: overlay.y }}
          size={{ width: overlay.width, height: overlay.height }}
          onDragStop={(e, d) => handleDragStop(overlay, d)}
          onResizeStop={(e, direction, ref, delta, position) =>
            handleResizeStop(overlay, ref, position)
          }
          bounds="parent"
          className="overlay-item"
        >
          <div
            className={`overlay-content overlay-${overlay.type}`}
            style={{
              fontSize: overlay.fontSize || '24px',
              color: overlay.color || '#ffffff',
              backgroundColor: overlay.backgroundColor || 'rgba(0, 0, 0, 0.5)',
              opacity: overlay.opacity !== undefined ? overlay.opacity : 1,
              pointerEvents: overlay.type === 'youtube_link' ? 'auto' : 'none', // Allow clicks on links
            }}
          >
            {overlay.type === 'text' ? (
              <div className="text-overlay">{overlay.content}</div>
            ) : overlay.type === 'youtube_link' ? (
              <div className="link-overlay">
                <a
                  href={overlay.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="youtube-link"
                  style={{
                    color: overlay.color || '#ffffff',
                    fontSize: overlay.fontSize || '18px',
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent drag when clicking link
                >
                  {overlay.label || 'YouTube Link'}
                </a>
              </div>
            ) : (
              <div className="image-overlay-container">
                <img
                  src={getImageUrl(overlay)}
                  alt="Overlay"
                  className="image-overlay"
                  onError={() => handleImageError(overlay._id, overlay.content)}
                  crossOrigin="anonymous"
                />
                {imageErrors[overlay._id] === 'failed' && (
                  <div className="image-error-text">Image failed to load</div>
                )}
              </div>
            )}
            <button
              className="delete-overlay-btn"
              onClick={() => handleDelete(overlay._id)}
              title="Delete overlay"
            >
              ×
            </button>
          </div>
        </Rnd>
      ))}
    </div>
  );
}

export default OverlayCanvas;
