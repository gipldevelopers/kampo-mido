"use client";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

export default function Toast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // 1. MOVED UP: Define handleClose before useEffect
  const handleClose = () => {
    setIsVisible(false); // Trigger exit animation
    // Wait for animation (500ms) to finish before removing from DOM
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // 2. useEffect can now safely call handleClose
  useEffect(() => {
    // Trigger entry animation (Fade In Up)
    const entryTimer = setTimeout(() => setIsVisible(true), 10);

    // Trigger exit animation (Fade Out Down)
    const exitTimer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <div 
      className={`fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out w-[calc(100%-1rem)] sm:w-auto max-w-[calc(100vw-2rem)] sm:max-w-md ${
        isVisible 
          ? "opacity-100 translate-y-0" // Visible State
          : "opacity-0 translate-y-8"   // Hidden State
      }`}
    >
      <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-lg border shadow-xl ${
        type === 'success' 
          ? 'bg-background border-primary text-foreground' 
          : 'bg-background border-destructive text-destructive'
      }`}>
        <div className={`p-0.5 sm:p-1 rounded-full shrink-0 ${
          type === 'success' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
        }`}>
          {type === 'success' ? <Check size={14} className="sm:w-4 sm:h-4" /> : <X size={14} className="sm:w-4 sm:h-4" />}
        </div>
        
        <p className="text-xs sm:text-sm font-medium break-words flex-1 min-w-0">{message}</p>
        
        <button 
          onClick={handleClose} 
          className="ml-2 sm:ml-4 p-0.5 sm:p-1 hover:bg-muted rounded-full transition-colors shrink-0"
          aria-label="Close notification"
        >
          <X size={12} className="sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
}