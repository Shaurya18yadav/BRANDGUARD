import React from 'react';
import { useBrand } from '../context/BrandContext';
import { Sparkles, ArrowRight, X, CheckCircle, ShieldAlert, Award, FileEdit, BarChart2 } from 'lucide-react';

interface GuidedDemoProps {
  onNavigate: (view: string) => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoProps> = ({ onNavigate }) => {
  const { tourStep, nextTourStep, endGuidedTour, setCurrentRole, activeSubmission } = useBrand();

  if (tourStep === null) return null;

  const tourStepsData = [
    {
      step: 1,
      title: 'Step 1: Load Messy Submission',
      icon: ShieldAlert,
      view: 'workspace',
      description:
        'We have loaded "Q4 Product Launch" into the Review Workspace. It contains obsolete product names ("CloudLens"), expired badges, 100% security guarantees, and conflicting metrics.',
      actionText: 'Proceed to Run Governance Review',
      action: () => {
        onNavigate('workspace');
        nextTourStep();
      },
    },
    {
      step: 2,
      title: 'Step 2: Inspect Reasoning Chains',
      icon: ShieldAlert,
      view: 'workspace',
      description:
        'Notice how every flagged phrase has an exact 6-step Reasoning Chain: Claim -> Applicable Rule -> Evidence -> Explanation -> Diff Correction -> Human Decision. Click any highlighted phrase on the left to see its evidence.',
      actionText: 'Next: Accept a Suggested Fix',
      action: () => {
        onNavigate('workspace');
        nextTourStep();
      },
    },
    {
      step: 3,
      title: 'Step 3: Accept Minimal-Change Fix',
      icon: CheckCircle,
      view: 'workspace',
      description:
        'Click "Accept Correction" on the CloudLens finding, then hit "Apply all accepted corrections". Notice how the draft replaces the retired name with "Nimbus Insight" while preserving the creator intent.',
      actionText: 'Next: Switch Role & Approve Draft',
      action: () => {
        // Switch to legal to demonstrate approval permissions
        setCurrentRole('legal');
        onNavigate('workspace');
        nextTourStep();
      },
    },
    {
      step: 4,
      title: 'Step 4: Grant Version-Bound Approval',
      icon: Award,
      view: 'approvals',
      description:
        'We switched your role to Marcus Vance (Legal Reviewer). Click "Approve Draft" in the workspace or the Approvals tab. The system binds the approval to an exact cryptographic content hash.',
      actionText: 'Next: Test Material Edit Invalidation',
      action: () => {
        onNavigate('approvals');
        nextTourStep();
      },
    },
    {
      step: 5,
      title: 'Step 5: Watch Approval Reset (Crucial Differentiator!)',
      icon: FileEdit,
      view: 'approvals',
      description:
        'Try editing the approved text in the test box. Notice how the instant a character changes, the approval seal breaks and status flips to "Reopened for review" with a full audit trail record!',
      actionText: 'Next: View Governance Insights',
      action: () => {
        onNavigate('insights');
        nextTourStep();
      },
    },
    {
      step: 6,
      title: 'Step 6: Governance Insights & Learning Loop',
      icon: BarChart2,
      view: 'insights',
      description:
        'Here the system closes the loop: turning repeated mistakes into governance insights. Discover which rules get disputed most (unclear rules), which claims lack sources, and review bottlenecks.',
      actionText: 'Finish Tour & Explore',
      action: () => {
        endGuidedTour();
      },
    },
  ];

  const currentStepData = tourStepsData[tourStep - 1] || tourStepsData[0];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#14284B] text-white p-5 rounded-2xl shadow-2xl border-2 border-[#FFD60A] relative">
        {/* Close Button */}
        <button
          onClick={endGuidedTour}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close guided demo"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-[#FFD60A] text-[#14284B] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-[#14284B]" />
            Tour {currentStepData.step} / {tourStepsData.length}
          </div>
          <span className="text-xs text-blue-200 font-semibold">{currentStepData.title}</span>
        </div>

        {/* Body */}
        <div className="flex gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-navy-800 border border-blue-400/20 flex items-center justify-center shrink-0 text-[#FFD60A]">
            <StepIcon className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">{currentStepData.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1e3865]">
          <span className="text-[11px] text-slate-400">Step {currentStepData.step} of 6</span>
          <button
            onClick={currentStepData.action}
            className="flex items-center gap-1.5 bg-[#FFD60A] hover:bg-[#ffe043] text-[#14284B] font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all transform hover:scale-[1.02]"
          >
            <span>{currentStepData.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
