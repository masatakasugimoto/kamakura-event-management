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
  const [topHeight, setTopHeight] = useState(defaultTopHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback((_clientY: number) => {
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  }, []);

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerHeight = containerRect.height;
    
    // Calculate new height percentage
    const relativeY = clientY - containerRect.top;
    const newTopHeight = (relativeY / containerHeight) * 100;
    
    // Clamp between min and max
    const clampedHeight = Math.max(minTopHeight, Math.min(maxTopHeight, newTopHeight));
    setTopHeight(clampedHeight);
  }, [isDragging, minTopHeight, maxTopHeight]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
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

  return (
    <div className="resizable-splitter-container" ref={containerRef}>
      <div 
        className="resizable-top-panel"
        style={{ height: `${topHeight}%` }}
      >
        {topContent}
      </div>
      
      <div
        className={`resizable-splitter ${isDragging ? 'dragging' : ''}`}
        ref={splitterRef}
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
        style={{ height: `${100 - topHeight}%` }}
      >
        {bottomContent}
      </div>
    </div>
  );
};

export default ResizableSplitter;