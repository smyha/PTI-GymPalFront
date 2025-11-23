'use client';

import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkoutTimerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  durationMinutes: number;
  workoutName?: string;
}

/**
 * WorkoutTimer Component
 * 
 * A beautiful timer component for workout sessions with:
 * - Countdown from workout duration
 * - Play/Pause functionality
 * - Reset functionality
 * - Visual progress indicator
 */
export function WorkoutTimer({ open, onOpenChange, durationMinutes, workoutName }: WorkoutTimerProps) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer when dialog opens
  useEffect(() => {
    if (open) {
      setTimeRemaining(durationMinutes * 60);
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [open, durationMinutes]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const handlePlay = () => {
    if (timeRemaining === 0) {
      // Reset if timer reached 0
      setTimeRemaining(durationMinutes * 60);
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(durationMinutes * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = durationMinutes > 0 ? ((durationMinutes * 60 - timeRemaining) / (durationMinutes * 60)) * 100 : 0;
  const isComplete = timeRemaining === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            {workoutName || t('workouts.workout', { defaultValue: 'Workout' })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-8 py-8">
          {/* Circular Progress Indicator */}
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={isComplete ? '#10b981' : '#f97316'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-bold ${isComplete ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {formatTime(timeRemaining)}
                </div>
                {isComplete && (
                  <p className="text-emerald-400 text-sm mt-2 font-semibold">
                    {t('workouts.timerComplete', { defaultValue: 'Workout Complete!' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4">
            {!isRunning && !isPaused && timeRemaining === durationMinutes * 60 && (
              <Button
                onClick={handlePlay}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                {t('workouts.startTimer', { defaultValue: 'Start' })}
              </Button>
            )}
            
            {isRunning && (
              <Button
                onClick={handlePause}
                size="lg"
                variant="outline"
                className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-8"
              >
                <Pause className="h-5 w-5 mr-2" />
                {t('workouts.pause', { defaultValue: 'Pause' })}
              </Button>
            )}
            
            {isPaused && (
              <Button
                onClick={handlePlay}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                {t('workouts.resume', { defaultValue: 'Resume' })}
              </Button>
            )}
            
            {(isPaused || isComplete) && (
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="border-slate-500 text-slate-300 hover:bg-slate-700 px-8"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                {t('workouts.reset', { defaultValue: 'Reset' })}
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>{t('workouts.progress', { defaultValue: 'Progress' })}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-orange-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

