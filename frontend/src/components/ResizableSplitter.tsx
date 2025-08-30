import React, { useState, useRef, useCallback, useEffect } from 'react';
import './ResizableSplitter.css';

interface ResizableSplitterProps {
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  defaultTopHeight?: number; // percentage (0-100)
  minTopHeight?: number; // percentage
  maxTopHeight?: number; // percentage
}

const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
  topContent,
  bottomContent,
  defaultTopHeight = 35,
  minTopHeight = 15,
  maxTopHeight = 85
}) => {
  // Use 50% for mobile devices, default for desktop
  const getMobileDefaultHeight = () => {
    if (window.innerWidth <= 768) {
      return 50; // Center split on mobile
    }
    return defaultTopHeight;
  };

  const [topHeight, setTopHeight] = useState(getMobileDefaultHeight());
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback((clientY: number) => {
    const headerHeight = window.innerWidth <= 768 ? 60 : 0;
    const availableHeight = window.innerHeight - headerHeight;
    const currentSplitterPosition = headerHeight + (availableHeight * topHeight / 100);
    const offset = clientY - currentSplitterPosition;
    
    setDragOffset(offset);
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  }, [topHeight]);

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    // For mobile, calculate relative to the available height (excluding header)
    const headerHeight = window.innerWidth <= 768 ? 60 : 0;
    const availableHeight = window.innerHeight - headerHeight;
    
    // Adjust for the initial touch offset to prevent jumping
    const adjustedClientY = clientY - dragOffset;
    
    // Calculate new height percentage based on viewport
    const relativeY = adjustedClientY - headerHeight;
    const newTopHeight = (relativeY / availableHeight) * 100;
    
    // Clamp between min and max
    const clampedHeight = Math.max(minTopHeight, Math.min(maxTopHeight, newTopHeight));
    setTopHeight(clampedHeight);
  }, [isDragging, dragOffset, minTopHeight, maxTopHeight]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setDragOffset(0);
    document.body.style.userSelect = '';
  }, []);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientY);
    }
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Add global event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Calculate mobile-specific positioning
  const isMobile = window.innerWidth <= 768;
  // const headerHeight = isMobile ? 60 : 0;
  // const availableHeight = isMobile ? window.innerHeight - headerHeight : '100%';
  
  const topPanelStyle = isMobile 
    ? { 
        height: `calc((100vh - 60px) * ${topHeight / 100})`,
        top: '60px'
      }
    : { height: `${topHeight}%` };
    
  const splitterStyle = isMobile
    ? {
        top: `calc(60px + (100vh - 60px) * ${topHeight / 100})`
      }
    : {};
    
  const bottomPanelStyle = isMobile
    ? {
        top: `calc(60px + (100vh - 60px) * ${topHeight / 100} + 12px)`,
        height: `calc((100vh - 60px) * ${(100 - topHeight) / 100} - 12px)`
      }
    : { height: `${100 - topHeight}%` };

  return (
    <div className="resizable-splitter-container" ref={containerRef}>
      <div 
        className="resizable-top-panel"
        style={topPanelStyle}
      >
        {topContent}
      </div>
      
      <div
        className={`resizable-splitter ${isDragging ? 'dragging' : ''}`}
        ref={splitterRef}
        style={splitterStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="splitter-handle">
          <div className="splitter-line"></div>
          <div className="splitter-grip">⋯</div>
          <div className="splitter-line"></div>
        </div>
      </div>
      
      <div 
        className="resizable-bottom-panel"
        style={bottomPanelStyle}
      >
        {bottomContent}
      </div>
    </div>
  );
};

export default ResizableSplitter;