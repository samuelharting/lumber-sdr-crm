import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export function Notification({ message, type, duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
    warning: InformationCircleIcon,
  };

  const colors = {
    success: {
      bg: 'bg-success',
      text: 'text-success',
      border: 'border-success',
    },
    error: {
      bg: 'bg-error',
      text: 'text-error',
      border: 'border-error',
    },
    info: {
      bg: 'bg-info',
      text: 'text-info',
      border: 'border-info',
    },
    warning: {
      bg: 'bg-warning',
      text: 'text-warning',
      border: 'border-warning',
    },
  };

  const Icon = icons[type];
  const color = colors[type];

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 ${color.border}`}>
      <div className="flex items-center p-4">
        <div className={`flex-shrink-0 ${color.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-slate-900">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="ml-4 flex-shrink-0 text-slate-400 hover:text-slate-600"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}