import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Composant Toast réutilisable pour les notifications
 * Usage: <Toast message="Hello" type="success" onClose={() => {}} />
 */
export const Toast = ({ message, type = 'info', onClose, duration = 3000, show = true }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      icon: '✓'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      icon: '✕'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      icon: '!'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      icon: 'ℹ'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 0 }}
          className={`fixed top-6 right-6 z-[80] max-w-md`}
        >
          <div className={`${style.bg} border-l-4 ${style.border} ${style.text} px-5 py-4 rounded-lg shadow-lg font-medium flex items-start gap-3`}>
            <span className="text-lg font-bold flex-shrink-0 w-6 text-center">{style.icon}</span>
            <span className="flex-1 text-sm">{message}</span>
            <button
              onClick={() => setIsVisible(false)}
              className="text-lg leading-none opacity-50 hover:opacity-100 transition flex-shrink-0"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
