"use client";

import React from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export type AgentStep = "writing" | "drawing" | "directing" | "idle";

interface StepIndicatorProps {
    currentStep: AgentStep;
    completedSteps: AgentStep[];
}

const steps: { id: AgentStep; label: string; description: string }[] = [
    { id: "writing", label: "Writer Agent", description: "Crafting the script" },
    { id: "drawing", label: "Artist Agent", description: "Generating visuals" },
    { id: "directing", label: "Director Agent", description: "Creating video" },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep,
    completedSteps,
}) => {
    const getStepStatus = (stepId: AgentStep) => {
        if (completedSteps.includes(stepId)) return "completed";
        if (currentStep === stepId) return "active";
        return "pending";
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-8">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-800 -z-10">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{
                            width: `${(completedSteps.length / steps.length) * 100
                                }%`,
                        }}
                    />
                </div>

                {steps.map((step) => {
                    const status = getStepStatus(step.id);
                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center gap-2 relative"
                        >
                            {/* Icon */}
                            <div
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${status === "completed"
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                        : status === "active"
                                            ? "bg-purple-600 animate-pulse"
                                            : "bg-gray-800"
                                    }
                `}
                            >
                                {status === "completed" ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : status === "active" ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-500" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="text-center">
                                <p
                                    className={`text-sm font-semibold ${status === "active"
                                            ? "text-purple-400"
                                            : status === "completed"
                                                ? "text-white"
                                                : "text-gray-500"
                                        }`}
                                >
                                    {step.label}
                                </p>
                                <p className="text-xs text-gray-600">{step.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
