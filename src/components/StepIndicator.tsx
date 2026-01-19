import React from 'react';
import { PenLine, Lock, Unlock } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  { icon: PenLine, label: 'Compose' },
  { icon: Lock, label: 'Encrypt' },
  { icon: Unlock, label: 'Decrypt' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex flex-col items-center mb-10">
      {/* Step Labels for Desktop */}
      <div className="hidden md:flex items-center justify-center gap-8 mb-4">
        {stepLabels.slice(0, totalSteps).map((step, index) => {
          const Icon = step.icon;
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          
          return (
            <div 
              key={index}
              className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'text-cyan-400 text-glow-aqua' 
                  : isCompleted 
                    ? 'text-violet-400' 
                    : 'text-slate-500'
              }`}
            >
              <Icon size={16} />
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Dots */}
      <div className="step-indicator">
        {Array.from({ length: totalSteps }, (_, index) => (
          <React.Fragment key={index}>
            <div
              className={`step-dot ${
                index + 1 < currentStep
                  ? 'completed'
                  : index + 1 === currentStep
                  ? 'active'
                  : ''
              }`}
            />
            {index < totalSteps - 1 && (
              <div
                className={`step-line ${index + 1 < currentStep ? 'completed' : ''}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
