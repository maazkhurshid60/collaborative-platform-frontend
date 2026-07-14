import React from 'react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex w-full gap-2 mb-8 px-6 md:px-20">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${index < currentStep ? 'bg-[#2C9993]' : 'bg-[#E5E7EB]'
                        }`}
                />
            ))}
        </div>
    );
};

export default StepIndicator;
