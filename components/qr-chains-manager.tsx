'use client';

import { useState, useEffect } from 'react';
import {
  createChain,
  getChain,
  updateChain,
  deleteChain,
  listChains,
  addStep,
  updateStep,
  removeStep,
  reorderSteps,
  startChain,
  getProgress,
  completeStep,
  resetProgress,
  getLeaderboard,
  generateStepQRContent,
  QRChain,
  ChainStep,
  ChainProgress,
} from '@/lib/qr-chains';
import {
  Link2,
  X,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Check,
  Play,
  RotateCcw,
  Trophy,
  ChevronRight,
  Settings,
  QrCode,
  MapPin,
  MessageSquare,
  Clock,
  Star,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QRChainsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateQR?: (content: string, name: string) => void;
}

export function QRChainsManager({
  isOpen,
  onClose,
  onGenerateQR,
}: QRChainsManagerProps) {
  const [chains, setChains] = useState<QRChain[]>([]);
  const [selectedChain, setSelectedChain] = useState<QRChain | null>(null);
  const [view, setView] = useState<'list' | 'edit' | 'play'>('list');
  const [editingStep, setEditingStep] = useState<ChainStep | null>(null);
  const [progress, setProgress] = useState<ChainProgress | null>(null);

  // New chain form
  const [newChainName, setNewChainName] = useState('');
  const [newChainDesc, setNewChainDesc] = useState('');
  const [showNewChainForm, setShowNewChainForm] = useState(false);

  // New step form
  const [newStepName, setNewStepName] = useState('');
  const [newStepContent, setNewStepContent] = useState('');
  const [newStepClue, setNewStepClue] = useState('');
  const [newStepPoints, setNewStepPoints] = useState(10);
  const [showNewStepForm, setShowNewStepForm] = useState(false);

  // Load chains
  useEffect(() => {
    if (isOpen) {
      loadChains();
    }
  }, [isOpen]);

  const loadChains = () => {
    setChains(listChains());
  };

  // Create new chain
  const handleCreateChain = () => {
    if (!newChainName.trim()) return;
    const chain = createChain(newChainName.trim(), newChainDesc.trim() || undefined);
    setChains(listChains());
    setSelectedChain(chain);
    setView('edit');
    setNewChainName('');
    setNewChainDesc('');
    setShowNewChainForm(false);
  };

  // Delete chain
  const handleDeleteChain = (chainId: string) => {
    if (confirm('Delete this chain and all its steps?')) {
      deleteChain(chainId);
      setChains(listChains());
      if (selectedChain?.id === chainId) {
        setSelectedChain(null);
        setView('list');
      }
    }
  };

  // Add step
  const handleAddStep = () => {
    if (!selectedChain || !newStepName.trim()) return;

    addStep(selectedChain.id, {
      name: newStepName.trim(),
      content: newStepContent.trim(),
      type: 'url',
      clue: newStepClue.trim() || undefined,
      points: newStepPoints,
    });

    setSelectedChain(getChain(selectedChain.id));
    setNewStepName('');
    setNewStepContent('');
    setNewStepClue('');
    setNewStepPoints(10);
    setShowNewStepForm(false);
  };

  // Remove step
  const handleRemoveStep = (stepId: string) => {
    if (!selectedChain) return;
    removeStep(selectedChain.id, stepId);
    setSelectedChain(getChain(selectedChain.id));
  };

  // Move step
  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    if (!selectedChain) return;

    const currentIndex = selectedChain.steps.findIndex(s => s.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= selectedChain.steps.length) return;

    const newOrder = [...selectedChain.steps.map(s => s.id)];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    reorderSteps(selectedChain.id, newOrder);
    setSelectedChain(getChain(selectedChain.id));
  };

  // Generate QR for step
  const handleGenerateStepQR = (step: ChainStep) => {
    if (!selectedChain || !onGenerateQR) return;
    const content = generateStepQRContent(selectedChain.id, step.id);
    onGenerateQR(content, `${selectedChain.name} - Step ${step.order + 1}`);
  };

  // Start playing chain
  const handleStartChain = () => {
    if (!selectedChain) return;
    const prog = startChain(selectedChain.id);
    setProgress(prog);
    setView('play');
  };

  // Complete step in play mode
  const handleCompletePlayStep = (stepId: string) => {
    if (!selectedChain) return;
    const result = completeStep(selectedChain.id, stepId);
    if (result.success) {
      setProgress(getProgress(selectedChain.id));
    }
  };

  // Reset progress
  const handleResetProgress = () => {
    if (!selectedChain) return;
    resetProgress(selectedChain.id);
    setProgress(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <Link2 className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">QR Code Chains</h2>
              <p className="text-sm text-muted-foreground">
                Create scavenger hunts and multi-step experiences
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

        {/* Navigation */}
        {selectedChain && view !== 'list' && (
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <button
              onClick={() => {
                setView('list');
                setSelectedChain(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Chains
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{selectedChain.name}</span>
            <div className="flex-1" />
            <div className="flex gap-2">
              <button
                onClick={() => setView('edit')}
                className={`rounded px-2 py-1 text-sm ${
                  view === 'edit' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  handleStartChain();
                }}
                className={`rounded px-2 py-1 text-sm ${
                  view === 'play' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Play
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'list' && (
            <div className="space-y-4">
              {/* New chain button */}
              {showNewChainForm ? (
                <div className="rounded-lg border border-border p-4">
                  <h3 className="mb-3 font-medium">Create New Chain</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newChainName}
                      onChange={(e) => setNewChainName(e.target.value)}
                      placeholder="Chain name (e.g., Office Scavenger Hunt)"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <textarea
                      value={newChainDesc}
                      onChange={(e) => setNewChainDesc(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateChain}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                      >
                        <Check className="h-4 w-4" />
                        Create
                      </button>
                      <button
                        onClick={() => setShowNewChainForm(false)}
                        className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewChainForm(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-4 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Create New Chain
                </button>
              )}

              {/* Chains list */}
              {chains.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Link2 className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No chains yet. Create your first scavenger hunt!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chains.map((chain) => (
                    <div
                      key={chain.id}
                      className="group flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          setSelectedChain(chain);
                          setView('edit');
                        }}
                      >
                        <h3 className="font-medium">{chain.name}</h3>
                        {chain.description && (
                          <p className="text-sm text-muted-foreground">{chain.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{chain.steps.length} steps</span>
                          <span>{chain.stats.totalStarts} starts</span>
                          <span>{chain.stats.totalCompletions} completions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setSelectedChain(chain);
                            handleStartChain();
                          }}
                          className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Play"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChain(chain.id)}
                          className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'edit' && selectedChain && (
            <div className="space-y-4">
              {/* Chain settings */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Chain Settings</h3>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require sequential completion</span>
                    <button
                      onClick={() => {
                        updateChain(selectedChain.id, {
                          settings: { requireSequential: !selectedChain.settings.requireSequential },
                        });
                        setSelectedChain(getChain(selectedChain.id));
                      }}
                    >
                      {selectedChain.settings.requireSequential ? (
                        <ToggleRight className="h-6 w-6 text-primary" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable points</span>
                    <button
                      onClick={() => {
                        updateChain(selectedChain.id, {
                          settings: { enablePoints: !selectedChain.settings.enablePoints },
                        });
                        setSelectedChain(getChain(selectedChain.id));
                      }}
                    >
                      {selectedChain.settings.enablePoints ? (
                        <ToggleRight className="h-6 w-6 text-primary" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show progress to participants</span>
                    <button
                      onClick={() => {
                        updateChain(selectedChain.id, {
                          settings: { showProgress: !selectedChain.settings.showProgress },
                        });
                        setSelectedChain(getChain(selectedChain.id));
                      }}
                    >
                      {selectedChain.settings.showProgress ? (
                        <ToggleRight className="h-6 w-6 text-primary" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Steps ({selectedChain.steps.length})</h3>
                </div>

                {selectedChain.steps.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No steps yet. Add your first step below.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedChain.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className="group flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleMoveStep(step.id, 'up')}
                            disabled={index === 0}
                            className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <span className="text-xs font-medium">{step.order + 1}</span>
                          <button
                            onClick={() => handleMoveStep(step.id, 'down')}
                            disabled={index === selectedChain.steps.length - 1}
                            className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium">{step.name}</h4>
                          {step.clue && (
                            <p className="text-sm text-muted-foreground">
                              Clue: {step.clue}
                            </p>
                          )}
                          {step.points && selectedChain.settings.enablePoints && (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-500">
                              <Star className="h-3 w-3" />
                              {step.points} pts
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleGenerateStepQR(step)}
                            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Generate QR"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveStep(step.id)}
                            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-red-500"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add step form */}
                {showNewStepForm ? (
                  <div className="mt-4 rounded-lg border border-border p-4">
                    <h4 className="mb-3 font-medium">Add New Step</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newStepName}
                        onChange={(e) => setNewStepName(e.target.value)}
                        placeholder="Step name"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={newStepContent}
                        onChange={(e) => setNewStepContent(e.target.value)}
                        placeholder="Content URL or text"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="text"
                        value={newStepClue}
                        onChange={(e) => setNewStepClue(e.target.value)}
                        placeholder="Clue to find this step (optional)"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {selectedChain.settings.enablePoints && (
                        <div>
                          <label className="text-sm text-muted-foreground">Points</label>
                          <input
                            type="number"
                            value={newStepPoints}
                            onChange={(e) => setNewStepPoints(parseInt(e.target.value) || 0)}
                            min="0"
                            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddStep}
                          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4" />
                          Add Step
                        </button>
                        <button
                          onClick={() => setShowNewStepForm(false)}
                          className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewStepForm(true)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Add Step
                  </button>
                )}
              </div>
            </div>
          )}

          {view === 'play' && selectedChain && (
            <div className="space-y-4">
              {/* Progress bar */}
              {selectedChain.settings.showProgress && progress && (
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {progress.completedSteps.length} / {selectedChain.steps.length}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(progress.completedSteps.length / selectedChain.steps.length) * 100}%`,
                      }}
                    />
                  </div>
                  {selectedChain.settings.enablePoints && (
                    <div className="mt-2 flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4" />
                      <span className="font-medium">{progress.totalPoints} points</span>
                    </div>
                  )}
                </div>
              )}

              {/* Steps */}
              <div className="space-y-2">
                {selectedChain.steps.map((step, index) => {
                  const isCompleted = progress?.completedSteps.includes(step.id);
                  const isCurrent = progress?.currentStep === index;
                  const isLocked =
                    selectedChain.settings.requireSequential &&
                    !selectedChain.settings.allowSkip &&
                    index > (progress?.currentStep || 0);

                  return (
                    <div
                      key={step.id}
                      className={`rounded-lg border p-4 ${
                        isCompleted
                          ? 'border-green-500 bg-green-500/10'
                          : isCurrent
                          ? 'border-primary bg-primary/10'
                          : isLocked
                          ? 'border-border bg-muted/50 opacity-50'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{step.name}</h4>
                          {step.clue && !isCompleted && (
                            <p className="text-sm text-muted-foreground">{step.clue}</p>
                          )}
                        </div>
                        {!isCompleted && !isLocked && (
                          <button
                            onClick={() => handleCompletePlayStep(step.id)}
                            className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                          >
                            Complete
                          </button>
                        )}
                        {step.points && selectedChain.settings.enablePoints && (
                          <span className="flex items-center gap-1 text-sm text-yellow-500">
                            <Star className="h-4 w-4" />
                            {step.points}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion */}
              {progress?.completedAt && (
                <div className="rounded-lg border border-green-500 bg-green-500/10 p-4 text-center">
                  <Trophy className="mx-auto h-8 w-8 text-yellow-500" />
                  <h3 className="mt-2 font-semibold">Chain Complete!</h3>
                  {selectedChain.settings.enablePoints && (
                    <p className="text-sm text-muted-foreground">
                      Total points: {progress.totalPoints}
                    </p>
                  )}
                </div>
              )}

              {/* Reset button */}
              <button
                onClick={handleResetProgress}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Progress
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
