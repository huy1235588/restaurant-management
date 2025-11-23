'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: number;
    name: string;
    required?: boolean;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <button
                                type="button"
                                onClick={() => onStepClick?.(step.id)}
                                disabled={!onStepClick}
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                                    currentStep === step.id &&
                                        'border-primary bg-primary text-primary-foreground',
                                    currentStep > step.id &&
                                        'border-primary bg-primary text-primary-foreground',
                                    currentStep < step.id &&
                                        'border-muted bg-background text-muted-foreground',
                                    onStepClick && 'cursor-pointer hover:border-primary/50'
                                )}
                            >
                                {currentStep > step.id ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    step.id
                                )}
                            </button>
                            <span
                                className={cn(
                                    'mt-2 text-xs font-medium',
                                    currentStep >= step.id
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {step.name}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'h-0.5 flex-1 transition-colors',
                                    currentStep > step.id
                                        ? 'bg-primary'
                                        : 'bg-muted'
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
