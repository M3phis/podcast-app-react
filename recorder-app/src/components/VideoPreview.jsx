import { forwardRef } from 'react';

const VideoPreview = forwardRef((props, ref) => {
  return (
    <div className="video-container">
      <video 
        ref={ref} 
        autoPlay 
        playsInline 
        muted 
        className="video-preview"
      />
    </div>
  );
});

export default VideoPreview; 