import { Suspense } from 'react';
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function Onboarding() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <OnboardingFlow />
    </Suspense>
  );
}
