'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Tutorial,
  TutorialStep,
  getAllTutorials,
  getTutorial,
  startTutorial,
  updateTutorialProgress,
  getTutorialProgress,
  isTutorialCompleted,
  getCompletedTutorialsCount,
  isOnboardingComplete,
  completeOnboarding,
  getRecommendedTutorial,
} from '@/lib/tutorials';
import {
  GraduationCap,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Check,
  Lightbulb,
  Clock,
  BookOpen,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorialId?: string;
}

export function TutorialModal({ isOpen, onClose, tutorialId }: TutorialModalProps) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showList, setShowList] = useState(!tutorialId);

  // Load tutorial
  useEffect(() => {
    if (isOpen && tutorialId) {
      const tutorial = getTutorial(tutorialId);
      if (tutorial) {
        setActiveTutorial(tutorial);
        setShowList(false);

        // Resume from saved progress
        const progress = getTutorialProgress();
        if (progress[tutorialId] && !progress[tutorialId].completedAt) {
          setCurrentStep(progress[tutorialId].currentStep);
        } else {
          setCurrentStep(0);
          startTutorial(tutorialId);
        }
      }
    } else if (isOpen) {
      setShowList(true);
      setActiveTutorial(null);
    }
  }, [isOpen, tutorialId]);

  // Handle step navigation
  const goToStep = useCallback((step: number) => {
    if (!activeTutorial) return;

    if (step >= 0 && step < activeTutorial.steps.length) {
      setCurrentStep(step);
      updateTutorialProgress(activeTutorial.id, step);
    }
  }, [activeTutorial]);

  // Handle next step
  const nextStep = () => {
    if (!activeTutorial) return;

    if (currentStep < activeTutorial.steps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      // Tutorial complete
      updateTutorialProgress(activeTutorial.id, currentStep);
      setShowList(true);
      setActiveTutorial(null);
    }
  };

  // Handle previous step
  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  // Start a tutorial
  const handleStartTutorial = (id: string) => {
    const tutorial = getTutorial(id);
    if (tutorial) {
      setActiveTutorial(tutorial);
      setShowList(false);
      setCurrentStep(0);
      startTutorial(id);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (activeTutorial && !showList) {
          setShowList(true);
          setActiveTutorial(null);
        } else {
          onClose();
        }
      }
    };

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (!activeTutorial || showList) return;
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleArrowKeys);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleArrowKeys);
    };
  }, [isOpen, activeTutorial, showList, onClose, currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {showList ? (
          <TutorialList
            onStart={handleStartTutorial}
            onClose={onClose}
          />
        ) : activeTutorial ? (
          <TutorialPlayer
            tutorial={activeTutorial}
            currentStep={currentStep}
            onNext={nextStep}
            onPrev={prevStep}
            onClose={() => {
              setShowList(true);
              setActiveTutorial(null);
            }}
            onStepSelect={goToStep}
          />
        ) : null}
      </div>
    </div>
  );
}

// Tutorial List
function TutorialList({
  onStart,
  onClose,
}: {
  onStart: (id: string) => void;
  onClose: () => void;
}) {
  const tutorials = getAllTutorials();
  const completedCount = getCompletedTutorialsCount();
  const recommended = getRecommendedTutorial();

  const categories = [
    { id: 'basics', label: 'Basics', icon: BookOpen },
    { id: 'features', label: 'Features', icon: Sparkles },
    { id: 'advanced', label: 'Advanced', icon: Star },
    { id: 'tips', label: 'Tips & Tricks', icon: Lightbulb },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Tutorials</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {tutorials.length} completed
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {Math.round((completedCount / tutorials.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(completedCount / tutorials.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Recommended */}
      {recommended && (
        <div className="border-b border-border p-4">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Recommended for you</p>
          <button
            onClick={() => onStart(recommended.id)}
            className="flex w-full items-center gap-4 rounded-xl bg-primary/10 p-4 text-left transition-colors hover:bg-primary/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{recommended.title}</h3>
              <p className="text-sm text-muted-foreground">{recommended.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-primary" />
          </button>
        </div>
      )}

      {/* Tutorial categories */}
      <div className="flex-1 overflow-y-auto p-4">
        {categories.map(category => {
          const categoryTutorials = tutorials.filter(t => t.category === category.id);
          if (categoryTutorials.length === 0) return null;

          return (
            <div key={category.id} className="mb-6 last:mb-0">
              <div className="mb-3 flex items-center gap-2">
                <category.icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{category.label}</h3>
              </div>
              <div className="space-y-2">
                {categoryTutorials.map(tutorial => (
                  <TutorialCard
                    key={tutorial.id}
                    tutorial={tutorial}
                    onStart={() => onStart(tutorial.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {completedCount === tutorials.length && (
        <div className="border-t border-border p-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-green-600">
            <Trophy className="h-4 w-4" />
            <span className="font-medium">All tutorials completed!</span>
          </div>
        </div>
      )}
    </>
  );
}

// Tutorial Card
function TutorialCard({
  tutorial,
  onStart,
}: {
  tutorial: Tutorial;
  onStart: () => void;
}) {
  const completed = isTutorialCompleted(tutorial.id);
  const progress = getTutorialProgress()[tutorial.id];
  const inProgress = progress && !progress.completedAt;

  return (
    <button
      onClick={onStart}
      className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
        completed ? 'bg-green-500/10' : 'bg-muted'
      }`}>
        {completed ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : inProgress ? (
          <Play className="h-5 w-5 text-primary" />
        ) : (
          <Play className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{tutorial.title}</h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {tutorial.estimatedTime}
          </span>
          <span>{tutorial.steps.length} steps</span>
          {inProgress && (
            <span className="text-primary">
              Step {progress.currentStep + 1}/{tutorial.steps.length}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

// Tutorial Player
function TutorialPlayer({
  tutorial,
  currentStep,
  onNext,
  onPrev,
  onClose,
  onStepSelect,
}: {
  tutorial: Tutorial;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onStepSelect: (step: number) => void;
}) {
  const step = tutorial.steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tutorial.steps.length - 1;
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-semibold">{tutorial.title}</h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {tutorial.steps.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-md text-center">
          {/* Step icon */}
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {isLast ? (
              <Trophy className="h-8 w-8 text-primary" />
            ) : (
              <span className="text-2xl font-bold text-primary">{currentStep + 1}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>

          {/* Description */}
          <p className="mb-6 text-muted-foreground">{step.description}</p>

          {/* Tip */}
          {step.tip && (
            <div className="inline-flex items-start gap-2 rounded-lg bg-yellow-500/10 p-4 text-left text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
              <span className="text-yellow-700 dark:text-yellow-300">{step.tip}</span>
            </div>
          )}
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 border-t border-border px-6 py-4">
        {tutorial.steps.map((_, index) => (
          <button
            key={index}
            onClick={() => onStepSelect(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentStep
                ? 'w-8 bg-primary'
                : index < currentStep
                ? 'w-2 bg-primary/50'
                : 'w-2 bg-muted'
            }`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border p-4">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {isLast ? (
            <>
              Complete
              <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </>
  );
}

// Tutorial Button
export function TutorialButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        title="Tutorials"
      >
        <GraduationCap className="h-4 w-4" />
        <span className="hidden sm:inline">Learn</span>
      </button>
      <TutorialModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

// Onboarding prompt for first-time users
export function OnboardingPrompt() {
  const [show, setShow] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    // Check if first time user
    if (!isOnboardingComplete()) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleStart = () => {
    setShow(false);
    setTutorialOpen(true);
  };

  const handleSkip = () => {
    completeOnboarding();
    setShow(false);
  };

  if (!show) {
    return tutorialOpen ? (
      <TutorialModal
        isOpen={tutorialOpen}
        onClose={() => {
          setTutorialOpen(false);
          completeOnboarding();
        }}
        tutorialId="getting-started"
      />
    ) : null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-border bg-card p-4 shadow-xl">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Welcome!</h3>
          <p className="text-sm text-muted-foreground">
            New here? Take a quick tour to learn the basics.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSkip}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Skip
        </button>
        <button
          onClick={handleStart}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Play className="h-4 w-4" />
          Start Tour
        </button>
      </div>
    </div>
  );
}
