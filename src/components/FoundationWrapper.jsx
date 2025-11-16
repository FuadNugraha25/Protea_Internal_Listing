/**
 * FoundationWrapper Component
 * 
 * A reusable wrapper component that isolates Foundation styles.
 * Use this wrapper when you want to use Foundation components
 * within a Bootstrap-based application.
 * 
 * Example:
 * <FoundationWrapper>
 *   <div className="grid-container">
 *     <div className="grid-x">
 *       <div className="cell">Foundation content here</div>
 *     </div>
 *   </div>
 * </FoundationWrapper>
 */

import React from 'react';
import '../styles/foundation-scoped.css';

const FoundationWrapper = ({ children, className = '', style = {} }) => {
  return (
    <div 
      className={`foundation-scope ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default FoundationWrapper;

