
'use client';

export default function OnboardingProgress({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-10">
      <div className="bg-forest h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
      <div className="text-center mt-2 text-sm text-gray-600">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}
