"use client";
import { useEffect, useState } from "react";
import { Check, X, AlertTriangle, Info } from "lucide-react";

export default function Toast({ message, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  useEffect(() => {
    const entryTimer = setTimeout(() => setIsVisible(true), 10);
    const exitTimer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: <Check size={20} className="text-white" />,
          title: 'Success!'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: <X size={20} className="text-white" />,
          title: 'Error!'
        };
      case 'warning':
        return {
          bg: 'bg-orange-500',
          icon: <AlertTriangle size={20} className="text-white" />,
          title: 'Warning!'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          icon: <Info size={20} className="text-white" />,
          title: 'Information!'
        };
    }
  };

  const config = getToastConfig(type || 'info');

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-in-out ${isVisible
        ? "opacity-100 translate-x-0"
        : "opacity-0 translate-x-8"
        }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded shadow-lg min-w-[450px] text-white ${config.bg}`}>
        <div className="shrink-0">
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">
            <span className="font-bold">{config.title}</span> <span className="font-medium opacity-90">{message}</span>
          </p>
        </div>

        <button
          onClick={handleClose}
          className="ml-4 p-1 hover:bg-white/20 rounded transition-colors shrink-0 text-white"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}