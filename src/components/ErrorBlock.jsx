import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBlock({ 
  title = 'An unexpected error occurred', 
  message = 'Unable to connect to the server. Please check your connection and try again.', 
  onRetry 
}) {
  return (
    <div className="error-block">
      <div className="error-block-icon">
        <AlertTriangle size={24} />
      </div>
      <div className="error-block-title">{title}</div>
      <p className="error-block-desc">{message}</p>
      
      {onRetry && (
        <button onClick={onRetry} className="btn-danger btn-sm">
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
