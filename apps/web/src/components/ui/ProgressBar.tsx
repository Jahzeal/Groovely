import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  return (
    <div className="flex items-center gap-3">
      {[...Array(totalSteps)].map((_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={i}>
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-accent-purple shadow-[0_0_12px_rgba(157,0,255,0.6)] scale-110'
                  : isCompleted
                  ? 'bg-accent-purple'
                  : 'bg-zinc-700'
              }`}
            />
            {i < totalSteps - 1 && (
              <div
                className={`w-12 h-0.5 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-accent-purple' : 'bg-zinc-800'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
