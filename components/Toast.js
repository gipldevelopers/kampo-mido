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
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        isVisible 
          ? "opacity-100 translate-y-0" // Visible State
          : "opacity-0 translate-y-8"   // Hidden State
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl ${
        type === 'success' 
          ? 'bg-background border-primary text-foreground' 
          : 'bg-background border-destructive text-destructive'
      }`}>
        <div className={`p-1 rounded-full ${
          type === 'success' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
        }`}>
          {type === 'success' ? <Check size={16} /> : <X size={16} />}
        </div>
        
        <p className="text-sm font-medium">{message}</p>
        
        <button 
          onClick={handleClose} 
          className="ml-4 p-1 hover:bg-muted rounded-full transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}