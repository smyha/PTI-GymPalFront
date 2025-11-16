import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dumbbell' | 'default';
}

export function LoadingSpinner({
  className = '',
  size = 'md',
  variant = 'dumbbell'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  if (variant === 'dumbbell') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <style>{`
          @keyframes dumbbell-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes dumbbell-wobble {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(0.85); }
          }

          .dumbbell-spinning {
            animation: dumbbell-spin 2s linear infinite;
          }

          .dumbbell-plate {
            animation: dumbbell-wobble 1s ease-in-out infinite;
          }
        `}</style>

        <svg
          className={`dumbbell-spinning ${sizeClasses[size]}`}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          {/* Left plate */}
          <rect
            x="5"
            y="35"
            width="12"
            height="30"
            rx="2"
            fill="currentColor"
            className="text-emerald-500 dumbbell-plate"
            opacity="0.8"
          />

          {/* Left bar section */}
          <rect
            x="17"
            y="40"
            width="8"
            height="20"
            rx="1"
            fill="currentColor"
            className="text-emerald-600"
            opacity="0.9"
          />

          {/* Center bar (main) */}
          <rect
            x="25"
            y="38"
            width="50"
            height="24"
            rx="3"
            fill="currentColor"
            className="text-emerald-500"
          />

          {/* Right bar section */}
          <rect
            x="75"
            y="40"
            width="8"
            height="20"
            rx="1"
            fill="currentColor"
            className="text-emerald-600"
            opacity="0.9"
          />

          {/* Right plate */}
          <rect
            x="83"
            y="35"
            width="12"
            height="30"
            rx="2"
            fill="currentColor"
            className="text-emerald-500 dumbbell-plate"
            opacity="0.8"
          />

          {/* Additional spinning circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            className="text-emerald-400"
            opacity="0.2"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div
        className={`spinner ${sizeClasses[size]} border-2 border-emerald-200 border-t-emerald-500 rounded-full`}
      />
    </div>
  );
}

// Export a combined component for loading states
export function LoadingOverlay({
  isLoading,
  variant = 'dumbbell',
  message = 'Loading...'
}: {
  isLoading: boolean;
  variant?: 'dumbbell' | 'default';
  message?: string;
}) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg p-8 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" variant={variant} />
        {message && <p className="text-white text-sm">{message}</p>}
      </div>
    </div>
  );
}
