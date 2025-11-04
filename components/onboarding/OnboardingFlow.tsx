'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Splash1 from './screens/Splash1';
import Splash2 from './screens/Splash2';
import Onboarding1 from './screens/Onboarding1';
import Onboarding11 from './screens/Onboarding11';
import Onboarding12 from './screens/Onboarding12';
import Onboarding13 from './screens/Onboarding13';
import Onboarding14 from './screens/Onboarding14';
import ChooseInterest from './screens/ChooseInterest';
import ChooseInterest1 from './screens/ChooseInterest1';
import ChooseInterest2 from './screens/ChooseInterest2';
import Complete from './screens/Complete';

type OnboardingStep = 
  | 'splash1' 
  | 'splash2' 
  | 'onboarding1' 
  | 'onboarding11' 
  | 'onboarding12' 
  | 'onboarding13' 
  | 'onboarding14' 
  | 'chooseInterest' 
  | 'chooseInterest1' 
  | 'chooseInterest2'
  | 'complete';

export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('splash1');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleNext = () => {
    const steps: OnboardingStep[] = [
      'splash1',
      'splash2',
      'onboarding1',
      'onboarding11',
      'onboarding12',
      'onboarding13',
      'onboarding14',
      'chooseInterest',
      'chooseInterest1',
      'chooseInterest2',
      'complete'
    ];

    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleSkip = () => {
    // Skip to the first interest selection screen
    setCurrentStep('chooseInterest');
  };

  const handleComplete = () => {
    localStorage.setItem('tokfri_onboarding_complete', 'true');
    // Save selected interests to localStorage for later use
    if (selectedInterests.length > 0) {
      localStorage.setItem('tokfri_user_interests', JSON.stringify(selectedInterests));
    }
    // Do NOT auto-redirect - let user click to proceed to login
    setCurrentStep('complete');
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      }
      return [...prev, interest];
    });
  };

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {currentStep === 'splash1' && <Splash1 onNext={handleNext} />}
      {currentStep === 'splash2' && <Splash2 onNext={handleNext} />}
      {currentStep === 'onboarding1' && <Onboarding1 onNext={handleNext} onSkip={handleSkip} />}
      {currentStep === 'onboarding11' && <Onboarding11 onNext={handleNext} onSkip={handleSkip} />}
      {currentStep === 'onboarding12' && <Onboarding12 onNext={handleNext} onSkip={handleSkip} />}
      {currentStep === 'onboarding13' && <Onboarding13 onNext={handleNext} onSkip={handleSkip} />}
      {currentStep === 'onboarding14' && <Onboarding14 onNext={handleNext} onSkip={handleSkip} />}
      {currentStep === 'chooseInterest' && (
        <ChooseInterest 
          onNext={handleNext} 
          onSkip={handleSkip}
          selectedInterests={selectedInterests}
          onInterestToggle={handleInterestToggle}
        />
      )}
      {currentStep === 'chooseInterest1' && (
        <ChooseInterest1 
          onNext={handleNext} 
          onSkip={handleSkip}
          selectedInterests={selectedInterests}
          onInterestToggle={handleInterestToggle}
        />
      )}
      {currentStep === 'chooseInterest2' && (
        <ChooseInterest2 
          onNext={handleComplete}
          selectedInterests={selectedInterests}
          onInterestToggle={handleInterestToggle}
        />
      )}
      {currentStep === 'complete' && <Complete />}
    </div>
  );
}
