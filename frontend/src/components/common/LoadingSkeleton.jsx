import React from 'react';
import './LoadingSkeleton.css';

/**
 * A generalized loading skeleton component.
 * Allows creating pulse-style placeholders for better UX during data fetching.
 */
const LoadingSkeleton = ({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) => {
  return (
    <div 
      className={`skeleton-pulse ${className}`} 
      style={{ width, height, borderRadius }}
    />
  );
};

export default LoadingSkeleton;
