import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBlock({ 
  title = 'حدث خطأ غير متوقع', 
  message = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.', 
  onRetry 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-500/5 border border-rose-500/20 text-rose-400 rounded-2xl max-w-xl mx-auto my-8">
      <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-rose-500/10 text-rose-400">
        <AlertTriangle size={28} />
      </div>
      <h3 className="text-base font-bold text-rose-300 mb-1 fontFamily-cairo">{title}</h3>
      <p className="text-xs text-rose-400/80 mb-6 max-w-md fontFamily-cairo leading-relaxed">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
        >
          <RefreshCw size={14} className="animate-spin-hover" />
          <span>إعادة المحاولة</span>
        </button>
      )}
    </div>
  );
}
