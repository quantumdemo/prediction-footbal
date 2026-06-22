'use client';

interface PredictionLoadingProps {
  step: number;
}

const steps = [
  'Searching for teams...',
  'Finding upcoming fixture...',
  'Checking league standings...',
  'Analyzing recent form...',
  'Fetching head-to-head records...',
  'Scanning injury reports...',
  'Calculating prediction...'
];

export default function PredictionLoading({ step }: PredictionLoadingProps) {
  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 bg-card-bg/50 rounded-3xl border border-border-custom backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div className="space-y-4 w-full">
          {steps.map((text, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 transition-all duration-500 ${
                index === step ? 'opacity-100 scale-105' :
                index < step ? 'opacity-40' : 'opacity-20'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                index === step ? 'bg-accent animate-pulse shadow-[0_0_8px_rgba(0,255,135,0.8)]' :
                index < step ? 'bg-accent' : 'bg-gray-600'
              }`}></div>
              <span className={`text-sm font-medium ${index === step ? 'text-accent' : 'text-gray-300'}`}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
