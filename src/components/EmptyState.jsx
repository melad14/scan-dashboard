import React from 'react';
import * as Icons from 'lucide-react';

export default function EmptyState({ 
  icon = 'Inbox', 
  title = 'لا توجد بيانات', 
  description = 'لا تتوفر أي سجلات لعرضها في الوقت الحالي.', 
  actionLabel, 
  onAction 
}) {
  const IconComponent = Icons[icon] || Icons.Inbox;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border-color rounded-2xl shadow-sm max-w-xl mx-auto my-8">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-brand/10 text-brand">
        <IconComponent size={32} />
      </div>
      <h3 className="text-lg font-bold text-primary mb-2 fontFamily-cairo">{title}</h3>
      <p className="text-sm text-secondary mb-6 max-w-md fontFamily-cairo leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary py-2.5 px-5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
