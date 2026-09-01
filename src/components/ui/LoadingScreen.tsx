import { Scale } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary text-accent mb-5 animate-pulse">
        <Scale size={32} strokeWidth={2} />
      </div>
      <p className="text-base text-text-muted font-medium">Loading LegalSense...</p>
    </div>
  );
}
