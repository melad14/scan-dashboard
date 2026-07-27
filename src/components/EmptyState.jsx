import React from 'react';
import * as Icons from 'lucide-react';

export default function EmptyState({ 
  icon = 'Inbox', 
  title = 'No data available', 
  description = 'There are no records to display at this time.', 
  actionLabel, 
  onAction 
}) {
  const IconComponent = Icons[icon] || Icons.Inbox;

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <IconComponent size={28} />
      </div>
      <div className="empty-state-title">{title}</div>
      <p className="empty-state-desc">{description}</p>
      
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
